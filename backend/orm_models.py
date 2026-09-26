import uuid
from datetime import date
from sqlalchemy import (
    Column, String, DateTime, ForeignKey, Integer, Numeric, Boolean, Date, Text, CheckConstraint, UniqueConstraint, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base

class School(Base):
    __tablename__ = "schools"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    location_state = Column(String, nullable=False)
    community_type = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=True)
    full_name = Column(String, nullable=False)
    role = Column(String, default="student")
    grade_level = Column(Integer, nullable=False)
    academic_year_start = Column(Date, nullable=False)
    academic_year_end = Column(Date, nullable=False)
    avatar = Column(String, default="astronaut")
    total_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    streak_days = Column(Integer, default=0)
    sound_enabled = Column(Boolean, default=True)
    ai_provider = Column(String, default="builtin")
    custom_api_key = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("role IN ('student', 'teacher', 'admin')", name="check_profile_role"),
    )

class StudentChapter(Base):
    __tablename__ = "student_chapters"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    subject = Column(String, nullable=False)
    chapter_number = Column(Integer, nullable=False)
    chapter_title = Column(String, nullable=False)
    status = Column(String, default="not_started")
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("subject IN ('Maths', 'Science', 'English')", name="check_chapter_subject"),
        CheckConstraint("status IN ('not_started', 'in_progress', 'completed')", name="check_chapter_status"),
        UniqueConstraint('user_id', 'subject', 'chapter_number', name='unique_chapter_per_subject'),
    )

class Badge(Base):
    __tablename__ = "badges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=True)
    xp_value = Column(Integer, default=0)
    category = Column(String, nullable=True)

class StudentBadge(Base):
    __tablename__ = "student_badges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badges.id"), nullable=False)
    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'badge_id', name='unique_student_badge'),
    )

class EvaluationTest(Base):
    __tablename__ = "evaluation_tests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    target_level = Column(Integer, nullable=False)
    subject = Column(String, nullable=False)
    score_percentage = Column(Numeric(5, 2), nullable=False)
    passed = Column(Boolean, default=False)
    taken_at = Column(DateTime(timezone=True), server_default=func.now())

class StudySession(Base):
    __tablename__ = "study_sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    subject = Column(String, nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("student_chapters.id"), nullable=True)
    duration_minutes = Column(Integer, default=0)
    questions_solved = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    session_date = Column(Date, default=date.today)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ===================== Phase 1: Expanded Schema =====================

class AcademicYear(Base):
    __tablename__ = "academic_years"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    year_name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Subject(Base):
    __tablename__ = "subjects"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Chapter(Base):
    __tablename__ = "chapters"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    chapter_number = Column(Integer, nullable=True)
    chapter_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DailyGrade(Base):
    __tablename__ = "daily_grades"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    date = Column(Date, nullable=False)
    grade = Column(String, nullable=True)
    points_earned = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (
        CheckConstraint("grade IN ('A', 'B', 'C', 'D', 'F')", name="ck_daily_grades_grade"),
    )


class WeeklyProgress(Base):
    __tablename__ = "weekly_progress"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    week_start = Column(Date, nullable=True)
    week_end = Column(Date, nullable=True)
    total_minutes = Column(Integer, nullable=True)
    days_completed = Column(Integer, nullable=True)
    average_grade = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Test(Base):
    __tablename__ = "tests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    level = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    questions = Column(JSON, nullable=True)
    passing_score = Column(Integer, default=70)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TestResult(Base):
    __tablename__ = "test_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id"), nullable=False)
    score = Column(Integer, nullable=True)
    passed = Column(Boolean, nullable=True)
    taken_at = Column(DateTime(timezone=True), server_default=func.now())


class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    message = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)
    __table_args__ = (
        CheckConstraint("category IN ('Improvement', 'Motivation', 'Challenge', 'Review')", name="ck_recommendations_category"),
    )


class Admin(Base):
    __tablename__ = "admins"
    id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"), primary_key=True, default=uuid.uuid4)
    school_id = Column(UUID(as_uuid=True), ForeignKey("schools.id"), nullable=True)
    role = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (
        CheckConstraint("role IN ('SuperAdmin', 'SchoolAdmin', 'Teacher')", name="ck_admins_role"),
    )
