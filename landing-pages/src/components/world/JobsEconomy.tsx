import { Link } from "react-router-dom";
import SectionWrapper from "./SectionWrapper";
import PhoneCallOverlay from "./PhoneCallOverlay";

interface JobCard {
  title: string;
  pay: string;
  description: string;
  icon: string;
}

const jobs: JobCard[] = [
  {
    title: "식당 알바",
    pay: "₩8,500/시간",
    description: "전화 받고, 주문 받고, 서빙하기",
    icon: "🍜",
  },
  {
    title: "카페 바리스타",
    pay: "₩9,000/시간",
    description: "음료 주문 듣고 만들기",
    icon: "☕",
  },
  {
    title: "배달",
    pay: "₩건당 3,000",
    description: "주소 읽고 배달하기",
    icon: "🛵",
  },
  {
    title: "심부름",
    pay: "₩5,000/건",
    description: "부대찌개 사서 배달하기",
    icon: "🏃",
  },
];

export default function JobsEconomy() {
  return (
    <SectionWrapper className="bg-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
        You need money. Time to work.
      </h2>
      <p className="text-center text-gray-500 mb-12 max-w-md mx-auto">
        Every job requires Korean. Every shift is a lesson.
      </p>

      {/* Job cards grid */}
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
        {jobs.map((job, i) => (
          <div
            key={i}
            className="group rounded-2xl border border-gray-200 p-5 hover:border-navy/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl group-hover:bg-navy/5 transition-colors">
                {job.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold text-gray-900 font-korean">
                    {job.title}
                  </h3>
                  <span className="text-xs font-medium text-navy bg-navy/5 px-2 py-0.5 rounded-full">
                    {job.pay}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-korean">
                  {job.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phone call preview */}
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-4">
          Your boss calls. In Korean, of course.
        </p>
        <PhoneCallOverlay callerName="편의점 사장님" callerLabel="Boss" />
      </div>

      <div className="flex justify-center mt-8">
        <Link
          to="/prototype/v2/work?tab=apply"
          className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
        >
          직접 해보기 →
        </Link>
      </div>
    </SectionWrapper>
  );
}
