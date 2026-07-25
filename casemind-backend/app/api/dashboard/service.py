from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.api.dashboard.schema import CitizenDashboardResponse, DashboardUser, DashboardStats, LawyerDashboardResponse, LawyerDashboardStats

class DashboardService:
    @staticmethod
    async def get_citizen_dashboard(user_id: str, db: AsyncIOMotorDatabase) -> CitizenDashboardResponse:
        # Fetch user
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        
        # 1. Fetch user's cases first to get case_ids for hearings
        cases_cursor = db["cases"].find({"created_by": user_id})
        case_ids = []
        recent_cases = []
        active_cases_count = 0
        
        async for case in cases_cursor:
            if "case_id" in case:
                case_ids.append(case["case_id"])
            if case.get("status") in ["Active", "Pending"]:
                active_cases_count += 1
                
        # Get recent cases
        recent_cases_cursor = db["cases"].find({"created_by": user_id}).sort("created_at", -1).limit(5)
        async for case in recent_cases_cursor:
            recent_cases.append({
                "id": str(case["_id"]),
                "case_id": case.get("case_id", ""),
                "title": case.get("title", "Unknown Case"),
                "status": case.get("status", "Pending"),
                "court": case.get("court", "Unknown Court"),
                "next_hearing": case.get("next_hearing")
            })

        # Calculate stats
        pending_hearings_count = 0
        if case_ids:
            pending_hearings_count = await db["hearings"].count_documents({"case_id": {"$in": case_ids}, "status": "Scheduled"})
            
        uploaded_documents_count = await db["documents"].count_documents({"uploaded_by": user_id})
        
        # Since we use the 'chats' collection for AI queries
        ai_queries_count = await db["chats"].count_documents({"user_id": user_id})

        # Notifications
        notifications_cursor = db["notifications"].find({"user_id": user_id}).sort("created_at", -1).limit(5)
        notifications = []
        async for notif in notifications_cursor:
            notifications.append({
                "id": str(notif["_id"]),
                "message": notif.get("message", ""),
                "created_at": notif.get("created_at", "").isoformat() if hasattr(notif.get("created_at"), "isoformat") else str(notif.get("created_at")),
                "read": notif.get("read", False)
            })

        # Upcoming Hearings
        upcoming_hearings = []
        if case_ids:
            hearings_cursor = db["hearings"].find({"case_id": {"$in": case_ids}, "status": "Scheduled"}).sort("date", 1).limit(3)
            async for hearing in hearings_cursor:
                upcoming_hearings.append({
                    "id": str(hearing["_id"]),
                    "case_id": hearing.get("case_id", ""),
                    "case_title": hearing.get("case_title", "Unknown Case"),
                    "date": hearing.get("date", "").isoformat() if hasattr(hearing.get("date"), "isoformat") else str(hearing.get("date")),
                    "court": hearing.get("court", "Unknown Court")
                })

        return CitizenDashboardResponse(
            user=DashboardUser(
                id=str(user["_id"]),
                name=user.get("full_name", ""),
                email=user.get("email", ""),
                role=user.get("role", "citizen")
            ),
            stats=DashboardStats(
                active_cases=active_cases_count,
                pending_hearings=pending_hearings_count,
                uploaded_documents=uploaded_documents_count,
                ai_queries=ai_queries_count
            ),
            recent_cases=recent_cases,
            notifications=notifications,
            upcoming_hearings=upcoming_hearings
        )

    @staticmethod
    async def get_lawyer_dashboard(user_id: str, db: AsyncIOMotorDatabase) -> LawyerDashboardResponse:
        import datetime
        user = await db["lawyers"].find_one({"_id": ObjectId(user_id)})
        
        cases_cursor = db["cases"].find({"lawyer": user_id})
        case_ids = []
        recent_cases = []
        active_cases_count = 0
        client_ids = set()
        
        async for case in cases_cursor:
            if "case_id" in case:
                case_ids.append(case["case_id"])
            if case.get("status") not in ["Closed", "Dismissed"]:
                active_cases_count += 1
            if "created_by" in case:
                client_ids.add(case["created_by"])
                
        active_clients_count = len(client_ids)
        pending_drafts_count = await db["cases"].count_documents({"lawyer": user_id, "status": "Draft"})

        recent_cases_cursor = db["cases"].find({"lawyer": user_id}).sort("created_at", -1).limit(5)
        async for case in recent_cases_cursor:
            recent_cases.append({
                "id": str(case["_id"]),
                "case_id": case.get("case_id", ""),
                "title": case.get("title", "Unknown Case"),
                "status": case.get("status", "Pending"),
                "court": case.get("court", "Unknown Court"),
                "next_hearing": case.get("next_hearing"),
                "priority": case.get("priority", "normal"),
                "client": case.get("petitioner_name", "Unknown Client")
            })

        today = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + datetime.timedelta(days=1)
        
        hearings_today_count = 0
        todays_hearings = []
        if case_ids:
            # Note: actual date fields might be strings or datetimes, simplified check here if it's stored as ISO strings
            # If date is string, this won't perfectly match today unless we query by regex or application level filter
            # Let's query all scheduled and filter in python if needed, or assume date is stored consistently
            hearings_cursor = db["hearings"].find({"case_id": {"$in": case_ids}, "status": "Scheduled"}).sort("date", 1)
            today_date_str = today.date().isoformat()
            async for hearing in hearings_cursor:
                h_date = hearing.get("date", "")
                h_date_str = h_date.isoformat().split("T")[0] if hasattr(h_date, "isoformat") else str(h_date).split("T")[0]
                
                if h_date_str == today_date_str:
                    hearings_today_count += 1
                    if len(todays_hearings) < 5:
                        todays_hearings.append({
                            "id": str(hearing["_id"]),
                            "case_id": hearing.get("case_id", ""),
                            "case_title": hearing.get("case_title", "Unknown Case"),
                            "date": h_date.isoformat() if hasattr(h_date, "isoformat") else str(h_date),
                            "court": hearing.get("court", "Unknown Court"),
                            "judge": hearing.get("judge", "Hon'ble Judge")
                        })
        
        notifications_cursor = db["notifications"].find({"user_id": user_id}).sort("created_at", -1).limit(5)
        notifications = []
        async for notif in notifications_cursor:
            notifications.append({
                "id": str(notif["_id"]),
                "message": notif.get("message", ""),
                "created_at": notif.get("created_at", "").isoformat() if hasattr(notif.get("created_at"), "isoformat") else str(notif.get("created_at")),
                "read": notif.get("read", False)
            })

        unread_notifications_count = await db["notifications"].count_documents({"user_id": user_id, "read": False})

        # Mocking today_priorities and ai_insights for the demo/dashboard feel
        # In production, these would be derived from complex queries or background workers
        today_priorities = []
        if hearings_today_count > 0:
            today_priorities.append({
                "id": "p1", "title": f"Hearing in {todays_hearings[0]['court']} today", 
                "type": "hearing", "urgent": True, "time": "In 2 hours"
            })
        if pending_drafts_count > 0:
            today_priorities.append({
                "id": "p2", "title": "Draft Pending Review", 
                "type": "draft", "urgent": False, "time": "Due Today"
            })
            
        today_priorities.append({
            "id": "p3", "title": "Missing Evidence for Case " + (recent_cases[0]["case_id"] if recent_cases else "101"),
            "type": "evidence", "urgent": True, "time": "Overdue"
        })

        ai_insights = [
            {
                "id": "ai1", "title": "Missing affidavit",
                "description": "AI scan indicates the petitioner's affidavit is missing from recent filings.",
                "type": "missing_document", "case_id": recent_cases[0]["case_id"] if recent_cases else None
            },
            {
                "id": "ai2", "title": "Precedent Found",
                "description": "A relevant Supreme Court judgement was found matching the facts of Case " + (recent_cases[1]["case_id"] if len(recent_cases)>1 else "102"),
                "type": "precedent", "case_id": recent_cases[1]["case_id"] if len(recent_cases)>1 else None
            }
        ]

        tasks = [
            {"id": "t1", "title": "Prepare Hearing Notes", "completed": False},
            {"id": "t2", "title": "Review Evidence", "completed": False},
            {"id": "t3", "title": "Draft Reply", "completed": True}
        ]
        
        # Calendar can just reuse upcoming hearings for now
        calendar = upcoming_hearings = []
        if case_ids:
            up_cursor = db["hearings"].find({"case_id": {"$in": case_ids}, "status": "Scheduled"}).sort("date", 1).limit(5)
            async for h in up_cursor:
                h_dt = h.get("date", "")
                calendar.append({
                    "id": str(h["_id"]),
                    "case_id": h.get("case_id", ""),
                    "case_title": h.get("case_title", "Unknown Case"),
                    "date": h_dt.isoformat() if hasattr(h_dt, "isoformat") else str(h_dt),
                    "court": h.get("court", "Unknown Court"),
                    "judge": h.get("judge", "Hon'ble Judge")
                })

        return LawyerDashboardResponse(
            lawyer=DashboardUser(
                id=str(user["_id"]),
                name=user.get("full_name", ""),
                email=user.get("email", ""),
                role=user.get("role", "lawyer")
            ),
            stats=LawyerDashboardStats(
                active_clients=active_clients_count,
                active_cases=active_cases_count,
                hearings_today=hearings_today_count,
                pending_drafts=pending_drafts_count,
                unread_notifications=unread_notifications_count
            ),
            today_priorities=today_priorities,
            active_cases=recent_cases,
            hearings=todays_hearings,
            tasks=tasks,
            recent_activity=notifications,
            notifications=notifications,
            ai_insights=ai_insights,
            calendar=calendar
        )
