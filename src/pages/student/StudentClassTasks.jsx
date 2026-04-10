import { useState, useEffect } from 'react';
import { getStudentClassTasks } from '@/services/classTaskService';
import { PERIODS } from '@/constants';
import { ClipboardList, BookOpen, PenLine, ChevronLeft, ChevronRight, CalendarX } from 'lucide-react';

const StudentClassTasks = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasksData, setTasksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const fetchTasks = async (date) => {
      setLoading(true);
      setNoData(false);
      try {
        const res = await getStudentClassTasks(date);
        if (res.data.tasksData) {
          setTasksData(res.data.tasksData);
        } else {
          setTasksData(null);
          setNoData(true);
        }
      } catch (err) {
        console.error('Error fetching class tasks:', err);
        setTasksData(null);
        setNoData(true);
      }
      setLoading(false);
    };
    fetchTasks(selectedDate);
  }, [selectedDate]);

  const navigateDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
    if (current.getDay() === 0) current.setDate(current.getDate() + direction);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isSunday = new Date(selectedDate).getDay() === 0;

  const visibleTasks = tasksData
    ? tasksData.filter(t => (t.classwork && t.classwork.trim()) || (t.homework && t.homework.trim()))
    : [];
  const homeworkCount = visibleTasks.filter(t => t.homework && t.homework.trim()).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2.5">
          <ClipboardList className="w-6 h-6 text-student-500" />
          Classwork & Homework
        </h1>
        <p className="text-gray-400 text-sm mt-1">View daily classwork done and homework assigned</p>
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-3.5 mb-5 shadow-sm">
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="font-semibold text-gray-800 font-display text-sm">{formattedDate}</div>
          {isToday && (
            <span className="text-xs text-student-500 font-medium tracking-wide uppercase">Today</span>
          )}
        </div>
        <button
          onClick={() => navigateDate(1)}
          disabled={isToday}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Homework count pill */}
      {tasksData && homeworkCount > 0 && (
        <div className="mb-5 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 rounded-full">
          <PenLine className="w-3.5 h-3.5" />
          {homeworkCount} subject{homeworkCount > 1 ? 's' : ''} with homework today
        </div>
      )}

      {/* States */}
      {isSunday ? (
        <EmptyState icon="🌅" title="It's Sunday!" subtitle="Enjoy your holiday — no classes today." />
      ) : loading ? (
        <LoadingSkeleton />
      ) : noData ? (
        <EmptyState
          icon={<CalendarX className="w-10 h-10 text-gray-300" />}
          title="Nothing uploaded yet"
          subtitle={`Your teacher hasn't added classwork for ${dayOfWeek}.`}
        />
      ) : (
        <div className="space-y-3">
          {visibleTasks.map((item) => {
            const periodInfo = PERIODS.find(p => p.number === item.period);
            const hasClasswork = item.classwork && item.classwork.trim();
            const hasHomework = item.homework && item.homework.trim();

            return (
              <div
                key={item.period}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <div className="w-8 h-8 rounded-lg bg-student-500 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white font-display">{item.period}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-800 font-display text-sm">{item.subject}</span>
                  </div>
                  {periodInfo && (
                    <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                      {periodInfo.startTime} – {periodInfo.endTime}
                    </span>
                  )}
                </div>

                {/* Classwork + Homework side by side */}
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  <TaskCell
                    icon={<BookOpen className="w-3.5 h-3.5" />}
                    label="Classwork"
                    content={hasClasswork ? item.classwork : null}
                    colorClass="text-student-500"
                    emptyText="Not recorded"
                  />
                  <TaskCell
                    icon={<PenLine className="w-3.5 h-3.5" />}
                    label="Homework"
                    content={hasHomework ? item.homework : null}
                    colorClass="text-amber-600"
                    highlight={!!hasHomework}
                    emptyText="No homework"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function TaskCell({ icon, label, content, colorClass, highlight, emptyText }) {
  return (
    <div className={`p-4 ${highlight ? 'bg-amber-50/50' : ''}`}>
      <div className={`flex items-center gap-1.5 mb-2 ${colorClass}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      {content ? (
        <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
      ) : (
        <p className="text-sm text-gray-300 italic">{emptyText}</p>
      )}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
      <div className="flex justify-center mb-3">
        {typeof icon === 'string' ? (
          <span className="text-4xl">{icon}</span>
        ) : icon}
      </div>
      <p className="font-semibold text-gray-600 font-display">{title}</p>
      <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-12 bg-gray-100" />
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-20" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentClassTasks;
