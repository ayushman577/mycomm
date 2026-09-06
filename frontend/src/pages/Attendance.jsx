import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getAttendance,
    getMembers,
    getCommunity,
    takeAttendance
} from '../services/communityService';

function Attendance() {
    const { communityId } = useParams();
    const navigate = useNavigate();

    const today = new Date();

    /* =========================================
       CORE STATE
    ============================================= */

    const [members, setMembers] = useState([]);
    const [community, setCommunity] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState('member');
    const [roleLoaded, setRoleLoaded] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    /* =========================================
       SAVE MODAL STATE
    ============================================= */

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveModalSuccess, setSaveModalSuccess] = useState(false);
    const [saveModalError, setSaveModalError] = useState('');

    /* =========================================
       MEMBER FILTER STATE
    ============================================= */

    const [selectedMonth, setSelectedMonth] = useState(
        String(today.getMonth() + 1)
    );

    const [selectedYear, setSelectedYear] = useState(
        String(today.getFullYear())
    );

    /* =========================================
       MANAGER DATE
       INTERNAL FORMAT: YYYY-MM-DD
    ============================================= */

    const [selectedDate, setSelectedDate] = useState(
        formatInputDate(today)
    );

    /* =========================================
       ATTENDANCE FORM

       Values can be:
       ''
       'present'
       'absent'
    ============================================= */

    const [attendanceForm, setAttendanceForm] = useState({});
    const [formInitialized, setFormInitialized] = useState(false);

    /* =========================================
       ROLE
    ============================================= */

    const normalizedRole = String(
        currentUserRole || 'member'
    ).toLowerCase();

    const isManager =
        normalizedRole === 'owner' ||
        normalizedRole === 'admin';

    /* =========================================
       DATE HELPERS
    ============================================= */

    function formatInputDate(dateVal) {
        const value = new Date(dateVal);

        if (Number.isNaN(value.getTime())) {
            return '';
        }

        const year = value.getFullYear();

        const month = String(
            value.getMonth() + 1
        ).padStart(2, '0');

        const day = String(
            value.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function formatDisplayDate(dateVal) {
        if (!dateVal) {
            return '';
        }

        const value = String(dateVal);

        /*
         * Handle ISO dates coming from MongoDB.
         * Example:
         * 2026-09-06T18:30:00.000Z
         *
         * We only need the calendar date:
         * 2026-09-06
         */

        if (value.includes('T')) {
            const datePart =
                value.split('T')[0];

            const parts =
                datePart.split('-');

            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }

        /*
         * Handle YYYY-MM-DD dates.
         */

        const parts =
            value.split('-');

        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        /*
         * Fallback for other valid date formats.
         */

        const dateObject =
            new Date(dateVal);

        if (
            Number.isNaN(
                dateObject.getTime()
            )
        ) {
            return '';
        }

        const year =
            dateObject.getFullYear();

        const month =
            String(
                dateObject.getMonth() + 1
            ).padStart(2, '0');

        const day =
            String(
                dateObject.getDate()
            ).padStart(2, '0');

        return `${day}/${month}/${year}`;
    }

    function formatSelectedDate(dateVal) {
        if (!dateVal) {
            return '';
        }

        const [year, month, day] = dateVal
            .split('-')
            .map(Number);

        const value = new Date(year, month - 1, day);

        if (Number.isNaN(value.getTime())) {
            return '';
        }

        return `${String(day).padStart(2, '0')} ${value.toLocaleString('en-GB', {
            month: 'short'
        })}, ${year}`;
    }

    /* =========================================
       MONTH OPTIONS
    ============================================= */

    const monthOptions = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    /* =========================================
       YEAR OPTIONS
    ============================================= */

    const yearOptions = useMemo(() => {
        const currentYear = today.getFullYear();

        const years = [];

        for (
            let year = currentYear - 2;
            year <= currentYear + 1;
            year++
        ) {
            years.push(year);
        }

        return years;
    }, []);

    /* =========================================
       SELECTED DATE PARTS
    ============================================= */

    const selectedDateParts = useMemo(() => {
        const [
            year = '',
            month = '',
            day = ''
        ] = selectedDate.split('-');

        return {
            year,
            month,
            day
        };
    }, [selectedDate]);

    /* =========================================
       AVAILABLE DAYS FOR CURRENT MONTH
    ============================================= */

    const availableDays = useMemo(() => {
        const year = Number(
            selectedDateParts.year
        );

        const month = Number(
            selectedDateParts.month
        );

        if (!year || !month) {
            return [];
        }

        const numberOfDays = new Date(
            year,
            month,
            0
        ).getDate();

        return Array.from(
            {
                length: numberOfDays
            },
            (_, index) => index + 1
        );
    }, [
        selectedDateParts.year,
        selectedDateParts.month
    ]);

    /* =========================================
       DATE CHANGE
    ============================================= */

    const handleManagerDateChange = (
        type,
        value
    ) => {
        let {
            year,
            month,
            day
        } = selectedDateParts;

        if (type === 'year') {
            year = String(value);
        }

        if (type === 'month') {
            month = String(value);
        }

        if (type === 'day') {
            day = String(value);
        }

        const maxDays = new Date(
            Number(year),
            Number(month),
            0
        ).getDate();

        let newDay = Number(day);

        if (!newDay || newDay > maxDays) {
            newDay = maxDays;
        }

        setSelectedDate(
            `${year}-${String(month).padStart(
                2,
                '0'
            )}-${String(newDay).padStart(
                2,
                '0'
            )}`
        );
    };

    /* =========================================
       LOAD MEMBERS & COMMUNITY
    ============================================= */

    const loadMembers = async () => {
        try {
            const [
                membersResponse,
                communityResponse
            ] = await Promise.all([
                getMembers(communityId),
                getCommunity(communityId)
            ]);

            const loadedMembers =
                membersResponse?.data?.members ||
                membersResponse?.data ||
                [];

            setMembers(
                Array.isArray(
                    loadedMembers
                )
                    ? loadedMembers
                    : []
            );

            setCurrentUserRole(
                membersResponse?.data
                    ?.currentUserRole ||
                membersResponse?.data?.role ||
                'member'
            );

            setCommunity(
                communityResponse?.data?.community ||
                communityResponse?.data ||
                null
            );

            setRoleLoaded(true);

        } catch (err) {
            console.error(
                'Failed to load members:',
                err
            );

            setError(
                err?.response?.data
                    ?.message ||
                'Failed to load community members.'
            );

            setRoleLoaded(true);
        }
    };

    /* =========================================
       LOAD ATTENDANCE
    ============================================= */

    const loadAttendance = async () => {
        try {
            setLoading(true);
            setError('');

            const params =
                isManager
                    ? {
                        type: 'day',
                        date: selectedDate
                    }
                    : {
                        type: 'month',
                        year: selectedYear,
                        month: selectedMonth
                    };

            const response =
                await getAttendance(
                    communityId,
                    params
                );

            const loadedAttendance =
                response?.data
                    ?.attendance ||
                response?.data ||
                [];

            console.log(
                'Attendance response:',
                response.data
            );

            setAttendance(
                Array.isArray(
                    loadedAttendance
                )
                    ? loadedAttendance
                    : []
            );

            setCurrentUserRole(
                response?.data
                    ?.currentUserRole ||
                response?.data?.role ||
                currentUserRole
            );

        } catch (err) {
            console.error(
                'Failed to load attendance:',
                err
            );

            setAttendance([]);

            setError(
                err?.response?.data
                    ?.message ||
                'Failed to load attendance records.'
            );

        } finally {
            setLoading(false);
        }
    };

    /* =========================================
       INITIAL DATA LOAD
    ============================================= */

    useEffect(() => {
        if (communityId) {
            loadMembers();
        }
    }, [communityId]);

    useEffect(() => {
        if (communityId && roleLoaded) {
            loadAttendance();
        }
    }, [
        communityId,
        roleLoaded,
        isManager,
        selectedDate,
        selectedMonth,
        selectedYear
    ]);

    /* =========================================
       ATTENDANCE MAP

       KEY = USER ID
    ============================================= */

    const attendanceMap = useMemo(() => {
        const map = {};

        attendance.forEach((record) => {
            const memberId =
                record?.member?._id ||
                record?.member;

            if (!memberId) {
                return;
            }

            const key =
                memberId.toString();

            map[key] = record;
        });

        return map;
    }, [attendance]);

    /* =========================================
       MEMBERS FOR SELECTED DATE
    ============================================= */

    const eligibleMembers = useMemo(() => {
        if (!selectedDate) {
            return [];
        }

        const [
            year,
            month,
            day
        ] = selectedDate
            .split('-')
            .map(Number);

        const selectedDateObject =
            new Date(
                year,
                month - 1,
                day,
                23,
                59,
                59,
                999
            );

        return members.filter(
            (member) => {
                if (!member?.joinedAt) {
                    return true;
                }

                const joinedAt =
                    new Date(
                        member.joinedAt
                    );

                if (
                    Number.isNaN(
                        joinedAt.getTime()
                    )
                ) {
                    return true;
                }

                return (
                    joinedAt.getTime() <=
                    selectedDateObject.getTime()
                );
            }
        );
    }, [
        members,
        selectedDate
    ]);

    /* =========================================
       ELIGIBLE MEMBER IDS

       Used to make sure attendance summary
       only counts currently eligible members.
    ============================================= */

    const eligibleMemberIds = useMemo(() => {
        return new Set(
            eligibleMembers
                .map(
                    (member) =>
                        member
                            ?.user
                            ?._id
                            ?.toString()
                )
                .filter(Boolean)
        );
    }, [eligibleMembers]);

    /* =========================================
       RELEVANT ATTENDANCE

       Manager:
         Only attendance belonging to members
         eligible on the selected date.

       Member:
         Use the attendance returned for the
         selected month.
    ============================================= */

    const relevantAttendance = useMemo(() => {
        if (!isManager) {
            return attendance;
        }

        return attendance.filter(
            (record) => {
                const memberId =
                    record?.member?._id?.toString() ||
                    record?.member?.toString();

                return (
                    memberId &&
                    eligibleMemberIds.has(
                        memberId
                    )
                );
            }
        );
    }, [
        attendance,
        eligibleMemberIds,
        isManager
    ]);

    /* =========================================
       INITIALIZE FORM FROM DATABASE

       Existing attendance:
         present -> present
         absent  -> absent

       No attendance:
         ''
    ============================================= */

    useEffect(() => {
        if (!isManager) {
            return;
        }

        const form = {};

        eligibleMembers.forEach(
            (member) => {
                const memberId =
                    member?.user?._id?.toString();

                if (!memberId) {
                    return;
                }

                const existingRecord =
                    attendanceMap[
                    memberId
                    ];

                form[memberId] =
                    existingRecord?.status ||
                    '';
            }
        );

        setAttendanceForm(form);
        setFormInitialized(true);

    }, [
        isManager,
        eligibleMembers,
        attendanceMap,
        selectedDate
    ]);

    /* =========================================
       ATTENDANCE SUMMARY

       Counts only relevant attendance records.
    ============================================= */

    const presentCount =
        relevantAttendance.filter(
            (record) =>
                record.status ===
                'present'
        ).length;

    const absentCount =
        relevantAttendance.filter(
            (record) =>
                record.status ===
                'absent'
        ).length;

    const totalMarked =
        presentCount +
        absentCount;

    /* =========================================
       SET MEMBER STATUS
    ============================================= */

    const setMemberStatus = (
        memberId,
        status
    ) => {
        setAttendanceForm(
            (current) => ({
                ...current,
                [memberId]: status
            })
        );
    };

    /* =========================================
       SAVE ATTENDANCE

       Only explicitly selected members
       are sent to the backend.
    ============================================= */

    const handleSaveAttendance =
        async () => {
            if (saving) {
                return;
            }

            const attendancePayload =
                eligibleMembers
                    .map(
                        (member) => {
                            const memberId =
                                member
                                    ?.user
                                    ?._id
                                    ?.toString();

                            if (!memberId) {
                                return null;
                            }

                            const status =
                                attendanceForm[
                                memberId
                                ];

                            if (
                                status !==
                                'present' &&
                                status !==
                                'absent'
                            ) {
                                return null;
                            }

                            return {
                                memberId,
                                status
                            };
                        }
                    )
                    .filter(
                        Boolean
                    );

            if (
                attendancePayload.length ===
                0
            ) {
                setSaveModalError(
                    'Please select Present or Absent for at least one member.'
                );

                setSaveModalSuccess(false);
                setShowSaveModal(true);

                return;
            }

            try {
                setSaving(true);
                setError('');

                setSaveModalError('');
                setSaveModalSuccess(false);
                setShowSaveModal(true);

                await takeAttendance(
                    communityId,
                    {
                        date:
                            selectedDate,
                        attendance:
                            attendancePayload
                    }
                );

                /*
                 * Reload from MongoDB.
                 * This keeps the UI in sync
                 * with the saved records.
                 */

                await loadAttendance();

                setSaveModalSuccess(true);
                setSaving(false);

                setTimeout(() => {
                    setShowSaveModal(false);
                    setSaveModalSuccess(false);
                }, 1200);

            } catch (err) {
                console.error(
                    'Save attendance error:',
                    err
                );

                setSaving(false);

                setSaveModalError(
                    err?.response?.data
                        ?.message ||
                    'Failed to save attendance.'
                );
            }
        };

    /* =========================================
       MEMBER ATTENDANCE SORTING
    ============================================= */

    const memberAttendance =
        useMemo(() => {
            if (isManager) {
                return [...attendance].sort(
                    (a, b) =>
                        new Date(
                            b.date
                        ).getTime() -
                        new Date(
                            a.date
                        ).getTime()
                );
            }

            const currentUser =
                members.find(
                    (member) =>
                        member?.user?._id
                );

            const joinedAt =
                currentUser?.joinedAt;

            if (!joinedAt) {
                return [...attendance].sort(
                    (a, b) =>
                        new Date(
                            b.date
                        ).getTime() -
                        new Date(
                            a.date
                        ).getTime()
                );
            }

            const joinedDate =
                new Date(joinedAt);

            if (
                Number.isNaN(
                    joinedDate.getTime()
                )
            ) {
                return [...attendance].sort(
                    (a, b) =>
                        new Date(
                            b.date
                        ).getTime() -
                        new Date(
                            a.date
                        ).getTime()
                );
            }

            return attendance
                .filter((record) => {
                    const attendanceDate =
                        new Date(record.date);

                    return (
                        !Number.isNaN(
                            attendanceDate.getTime()
                        ) &&
                        attendanceDate.getTime() >=
                        joinedDate.getTime()
                    );
                })
                .sort(
                    (a, b) =>
                        new Date(
                            b.date
                        ).getTime() -
                        new Date(
                            a.date
                        ).getTime()
                );

        }, [
            attendance,
            members,
            isManager
        ]);

    /* =========================================
       LOADING
    ============================================= */

    if (loading) {
        return (
            <main
                className="community-dashboard-page dashboard-loading-state"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999
                }}
            >
                <style>{`
                    @keyframes miniPulse {
                        0%, 100% {
                            opacity: 0.25;
                            transform: scale(0.75);
                            box-shadow: none;
                        }

                        50% {
                            opacity: 1;
                            transform: scale(1.35);
                            box-shadow:
                                0 0 10px var(--neon-accent),
                                0 0 20px var(--neon-accent);
                        }
                    }
                `}</style>

                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                    }}
                >
                    {[0, 0.16, 0.32].map((delay, i) => (
                        <div
                            key={i}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--neon-accent)',
                                animation:
                                    'miniPulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                animationDelay: `${delay}s`
                            }}
                        />
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main className="attendance-page">

            <div className="attendance-container">

                {/* =========================================
                   HEADER
                ========================================= */}

                <header className="announcements-header">

                    <div>

                        <div className="workspace-badge-row">

                            <span className="community-role">
                                {community?.name || 'Community'}
                            </span>

                        </div>

                        <h1 style={{ textTransform: 'none' }}>
                            Attendance
                        </h1>

                        <p>
                            {isManager
                                ? 'Manage daily attendance for community members.'
                                : 'View your attendance history.'}
                        </p>

                    </div>

                    <button
                        type="button"
                        className="button button-ghost button-small"
                        onClick={() =>
                            navigate(`/community/${communityId}`)
                        }
                    >

                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >

                            <line
                                x1="19"
                                y1="12"
                                x2="5"
                                y2="12"
                            ></line>

                            <polyline
                                points="12 19 5 12 12 5"
                            ></polyline>

                        </svg>

                        Community Dashboard

                    </button>

                </header>

                {/* =========================================
                   ERROR
                ========================================= */}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {/* =========================================
                   MEMBER VIEW
                ========================================= */}

                {!isManager && (
                    <>

                        <section className="attendance-toolbar member-toolbar-grid">

                            <div className="attendance-filter-group">

                                <label htmlFor="monthSelect">
                                    Month
                                </label>

                                <select
                                    id="monthSelect"
                                    value={
                                        selectedMonth
                                    }
                                    onChange={(e) =>
                                        setSelectedMonth(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                >

                                    {monthOptions.map(
                                        (
                                            monthName,
                                            index
                                        ) => (
                                            <option
                                                key={
                                                    monthName
                                                }
                                                value={
                                                    index +
                                                    1
                                                }
                                            >
                                                {
                                                    monthName
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            <div className="attendance-filter-group">

                                <label htmlFor="yearSelect">
                                    Year
                                </label>

                                <select
                                    id="yearSelect"
                                    value={
                                        selectedYear
                                    }
                                    onChange={(e) =>
                                        setSelectedYear(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                >

                                    {yearOptions.map(
                                        (
                                            yearValue
                                        ) => (
                                            <option
                                                key={
                                                    yearValue
                                                }
                                                value={
                                                    yearValue
                                                }
                                            >
                                                {
                                                    yearValue
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </section>

                        <section className="attendance-summary">

                            <div className="attendance-summary-item">

                                <span>
                                    Present
                                </span>

                                <strong
                                    style={{
                                        color:
                                            '#2ecc71'
                                    }}
                                >
                                    {
                                        presentCount
                                    }
                                </strong>

                            </div>

                            <div className="attendance-summary-item">

                                <span>
                                    Absent
                                </span>

                                <strong
                                    style={{
                                        color:
                                            'var(--neon-accent)'
                                    }}
                                >
                                    {
                                        absentCount
                                    }
                                </strong>

                            </div>

                        </section>

                        {memberAttendance.length ===
                            0 ? (

                            <div className="attendance-empty">

                                <h2>
                                    No Attendance Records
                                </h2>

                                <p>
                                    No attendance has been
                                    recorded for{' '}
                                    {
                                        monthOptions[
                                        Number(
                                            selectedMonth
                                        ) - 1
                                        ]
                                    }{' '}
                                    {selectedYear}.
                                </p>

                            </div>

                        ) : (

                            <section className="member-attendance-list">

                                {memberAttendance.map(
                                    (record) => (
                                        <article
                                            className="member-attendance-card"
                                            key={
                                                record._id
                                            }
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '16px 20px',
                                                minHeight: '64px'
                                            }}
                                        >

                                            <div
                                                className="attendance-record-info"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}
                                            >

                                                <strong
                                                    style={{
                                                        fontSize: '15px',
                                                        fontWeight: '600',
                                                        color: 'var(--text-primary)',
                                                        letterSpacing: '0'
                                                    }}
                                                >
                                                    {
                                                        formatSelectedDate(
                                                            selectedDate
                                                        )
                                                    }
                                                </strong>

                                            </div>

                                            <span
                                                className={`member-attendance-status ${record.status}`}
                                                style={{
                                                    minWidth: '78px',
                                                    textAlign: 'center',
                                                    padding: '6px 12px',
                                                    borderRadius: '999px',
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    letterSpacing: '0.02em'
                                                }}
                                            >

                                                {record.status ===
                                                    'present'
                                                    ? 'Present'
                                                    : 'Absent'}

                                            </span>

                                        </article>
                                    )
                                )}

                            </section>
                        )}

                    </>
                )}

                {/* =========================================
                   MANAGER VIEW
                ========================================= */}

                {isManager && (
                    <>

                        {/* DATE SELECTORS */}

                        <section className="attendance-toolbar manager-toolbar">

                            <div className="attendance-filter-group">

                                <label htmlFor="managerDay">
                                    Day
                                </label>

                                <select
                                    id="managerDay"
                                    value={
                                        Number(
                                            selectedDateParts.day
                                        )
                                    }
                                    onChange={(e) =>
                                        handleManagerDateChange(
                                            'day',
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                >

                                    {availableDays.map(
                                        (day) => (
                                            <option
                                                key={
                                                    day
                                                }
                                                value={
                                                    day
                                                }
                                            >
                                                {
                                                    String(
                                                        day
                                                    ).padStart(
                                                        2,
                                                        '0'
                                                    )
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            <div className="attendance-filter-group">

                                <label htmlFor="managerMonth">
                                    Month
                                </label>

                                <select
                                    id="managerMonth"
                                    value={
                                        Number(
                                            selectedDateParts.month
                                        )
                                    }
                                    onChange={(e) =>
                                        handleManagerDateChange(
                                            'month',
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                >

                                    {monthOptions.map(
                                        (
                                            monthName,
                                            index
                                        ) => (
                                            <option
                                                key={
                                                    monthName
                                                }
                                                value={
                                                    index +
                                                    1
                                                }
                                            >
                                                {
                                                    monthName
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            <div className="attendance-filter-group">

                                <label htmlFor="managerYear">
                                    Year
                                </label>

                                <select
                                    id="managerYear"
                                    value={
                                        Number(
                                            selectedDateParts.year
                                        )
                                    }
                                    onChange={(e) =>
                                        handleManagerDateChange(
                                            'year',
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                >

                                    {yearOptions.map(
                                        (
                                            yearValue
                                        ) => (
                                            <option
                                                key={
                                                    yearValue
                                                }
                                                value={
                                                    yearValue
                                                }
                                            >
                                                {
                                                    yearValue
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </section>

                        {/* SELECTED DATE */}

                        <div
                            style={{
                                textAlign:
                                    'center',
                                color:
                                    'var(--text-secondary)',
                                fontSize:
                                    '13px',
                                fontWeight:
                                    '600',
                                marginTop:
                                    '2px'
                            }}
                        >

                            Selected Date:{' '}

                            <span
                                style={{
                                    color:
                                        'var(--neon-accent)'
                                }}
                            >
                                {
                                    formatDisplayDate(
                                        selectedDate
                                    )
                                }
                            </span>

                        </div>

                        {/* SUMMARY */}

                        <section className="attendance-summary">

                            <div className="attendance-summary-item">

                                <span>
                                    Present
                                </span>

                                <strong
                                    style={{
                                        color:
                                            '#2ecc71'
                                    }}
                                >
                                    {
                                        presentCount
                                    }
                                </strong>

                            </div>

                            <div className="attendance-summary-item">

                                <span>
                                    Absent
                                </span>

                                <strong
                                    style={{
                                        color:
                                            'var(--neon-accent)'
                                    }}
                                >
                                    {
                                        absentCount
                                    }
                                </strong>

                            </div>

                            <div className="attendance-summary-item">

                                <span>
                                    Selected Date
                                </span>

                                <strong className="attendance-summary-date">
                                    {
                                        formatSelectedDate(
                                            selectedDate
                                        )
                                    }
                                </strong>

                            </div>

                        </section>

                        {/* =========================================
                           ATTENDANCE LIST
                        ========================================= */}

                        <section className="manager-attendance-section">

                            <div className="manager-attendance-heading">

                                <div>

                                    <h2>
                                        Member Attendance
                                    </h2>

                                    <p>
                                        Mark attendance for members on{' '}
                                        {
                                            formatDisplayDate(
                                                selectedDate
                                            )
                                        }.
                                    </p>

                                </div>

                            </div>

                            {!formInitialized ||
                                eligibleMembers.length ===
                                0 ? (

                                <div className="attendance-empty">

                                    <h2>
                                        No Members to Mark
                                    </h2>

                                    <p>
                                        No community members had
                                        joined by this selected date.
                                    </p>

                                </div>

                            ) : (

                                <div className="manager-attendance-list">

                                    {eligibleMembers.map(
                                        (member) => {

                                            const memberId =
                                                member
                                                    ?.user
                                                    ?._id
                                                    ?.toString();

                                            if (
                                                !memberId
                                            ) {
                                                return null;
                                            }

                                            const memberName =
                                                member
                                                    ?.user
                                                    ?.username ||
                                                member
                                                    ?.user
                                                    ?.name ||
                                                member
                                                    ?.user
                                                    ?.email ||
                                                'Unknown Member';

                                            const memberDesignation =
                                                member?.role ||
                                                'member';

                                            const status =
                                                attendanceForm[
                                                memberId
                                                ] || '';

                                            return (
                                                <div
                                                    className="manager-attendance-row"
                                                    key={
                                                        member._id ||
                                                        memberId
                                                    }
                                                >

                                                    <div className="manager-attendance-member">

                                                        <strong>
                                                            {
                                                                memberName
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                memberDesignation
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase() +
                                                                memberDesignation.slice(
                                                                    1
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                    <div className="manager-attendance-controls">

                                                        <div className="attendance-choice">

                                                            <button
                                                                type="button"
                                                                className={`button button-small ${status ===
                                                                    'present'
                                                                    ? 'button-primary'
                                                                    : 'button-ghost'
                                                                    }`}
                                                                disabled={
                                                                    saving
                                                                }
                                                                onClick={() =>
                                                                    setMemberStatus(
                                                                        memberId,
                                                                        'present'
                                                                    )
                                                                }
                                                                style={
                                                                    status ===
                                                                        'present'
                                                                        ? {
                                                                            background:
                                                                                '#2ecc71',
                                                                            borderColor:
                                                                                '#2ecc71',
                                                                            color:
                                                                                '#000'
                                                                        }
                                                                        : {}
                                                                }
                                                            >
                                                                Present
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className={`button button-small ${status ===
                                                                    'absent'
                                                                    ? 'button-primary'
                                                                    : 'button-ghost'
                                                                    }`}
                                                                disabled={
                                                                    saving
                                                                }
                                                                onClick={() =>
                                                                    setMemberStatus(
                                                                        memberId,
                                                                        'absent'
                                                                    )
                                                                }
                                                                style={
                                                                    status ===
                                                                        'absent'
                                                                        ? {
                                                                            background:
                                                                                'var(--neon-accent)',
                                                                            borderColor:
                                                                                'var(--neon-accent)',
                                                                            color:
                                                                                '#fff'
                                                                        }
                                                                        : {}
                                                                }
                                                            >
                                                                Absent
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            )}

                            {/* =========================================
                               SAVE BUTTON
                            ========================================= */}

                            <div className="manager-attendance-footer">

                                <button
                                    type="button"
                                    className="button button-primary"
                                    onClick={
                                        handleSaveAttendance
                                    }
                                    disabled={
                                        saving ||
                                        eligibleMembers.length ===
                                        0
                                    }
                                    style={{
                                        width: '100%',
                                        justifyContent:
                                            'center'
                                    }}
                                >

                                    {saving ? (
                                        <span className="spinner"></span>
                                    ) : (
                                        'Save Attendance'
                                    )}

                                </button>

                            </div>

                        </section>

                    </>
                )}

                {/* =========================================
                   MODERN REDESIGNED SAVE ATTENDANCE MODAL
                ========================================= */}

                {showSaveModal && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        onClick={() => {
                            if (!saving) {
                                setShowSaveModal(false);
                                setSaveModalSuccess(false);
                                setSaveModalError('');
                            }
                        }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.82)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            zIndex: 9999
                        }}
                    >

                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '420px',
                                width: '100%',
                                background: 'linear-gradient(145deg, #131418 0%, #090a0d 100%)',
                                border: `1px solid ${saveModalError
                                    ? 'rgba(255, 51, 51, 0.4)'
                                    : saveModalSuccess
                                        ? 'rgba(46, 204, 113, 0.4)'
                                        : '#242731'
                                    }`,
                                borderRadius: '16px',
                                padding: '36px 32px 30px',
                                textAlign: 'center',
                                boxShadow: saveModalError
                                    ? '0 24px 48px rgba(0, 0, 0, 0.85), 0 0 24px rgba(255, 51, 51, 0.15)'
                                    : saveModalSuccess
                                        ? '0 24px 48px rgba(0, 0, 0, 0.85), 0 0 24px rgba(46, 204, 113, 0.15)'
                                        : '0 24px 48px rgba(0, 0, 0, 0.85)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '14px'
                            }}
                        >

                            {saving ? (
                                <>

                                    <div
                                        style={{
                                            width: '52px',
                                            height: '52px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            background: '#0d0f14',
                                            border: '1px solid #232733',
                                            marginBottom: '6px'
                                        }}
                                    >
                                        <div className="spinner"></div>
                                    </div>

                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: '19px',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            textTransform: 'none',
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        Saving Attendance
                                    </h2>

                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: '13px',
                                            lineHeight: 1.6,
                                            color: 'var(--text-secondary, #a1a1aa)'
                                        }}
                                    >
                                        Synchronizing records for{' '}

                                        <span
                                            style={{
                                                color: 'var(--neon-accent, #ff3333)',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {formatDisplayDate(selectedDate)}
                                        </span>

                                        ...
                                    </p>

                                </>

                            ) : saveModalSuccess ? (

                                <>

                                    <div
                                        style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(46, 204, 113, 0.15)',
                                            border: '1px solid #2ecc71',
                                            color: '#2ecc71',
                                            fontSize: '22px',
                                            fontWeight: '700',
                                            boxShadow: '0 0 16px rgba(46, 204, 113, 0.3)',
                                            marginBottom: '6px'
                                        }}
                                    >
                                        ✓
                                    </div>

                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: '19px',
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            textTransform: 'none',
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        Attendance Saved
                                    </h2>

                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: '13px',
                                            lineHeight: 1.6,
                                            color: '#a1a1aa'
                                        }}
                                    >
                                        Attendance has been successfully recorded.
                                    </p>

                                </>

                            ) : saveModalError ? (

                                <>

                                    <div
                                        style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(255, 51, 51, 0.15)',
                                            border: '1px solid var(--neon-accent, #ff3333)',
                                            color: 'var(--neon-accent, #ff3333)',
                                            fontSize: '22px',
                                            fontWeight: '700',
                                            boxShadow: '0 0 16px rgba(255, 51, 51, 0.3)',
                                            marginBottom: '6px'
                                        }}
                                    >
                                        !
                                    </div>

                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: '19px',
                                            fontWeight: 700,
                                            color: 'var(--neon-accent, #ff3333)',
                                            textTransform: 'none',
                                            letterSpacing: '-0.02em'
                                        }}
                                    >
                                        Unable to Save
                                    </h2>

                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: '13px',
                                            lineHeight: 1.6,
                                            color: '#a1a1aa'
                                        }}
                                    >
                                        {saveModalError}
                                    </p>

                                    <div
                                        style={{
                                            width: '100%',
                                            marginTop: '10px'
                                        }}
                                    >

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowSaveModal(false);
                                                setSaveModalError('');
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '10px 18px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                letterSpacing: '0.04em',
                                                background: '#16181f',
                                                border: '1px solid #282c39',
                                                color: '#e4e4e7',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            Dismiss
                                        </button>

                                    </div>

                                </>

                            ) : null}

                        </div>

                    </div>
                )}

            </div>

        </main>
    );
}

export default Attendance;