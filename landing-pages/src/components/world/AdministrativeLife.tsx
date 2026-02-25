import { Link } from "react-router-dom";
import SectionWrapper from "./SectionWrapper";

export default function AdministrativeLife() {
  return (
    <SectionWrapper className="bg-slate-50">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
        Even paperwork is in Korean.
      </h2>
      <p className="text-center text-gray-500 mb-12 max-w-md mx-auto">
        You'll learn vocabulary you can't find in any textbook.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Registration form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Document header */}
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-400 tracking-wider">
              출입국관리사무소
            </span>
            <span className="text-lg">🏛️</span>
          </div>

          <div className="p-5">
            <h3 className="text-center font-bold font-korean text-gray-900 mb-4">
              외국인등록증 신청서
            </h3>

            {/* Seal */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-red-300 border-dashed flex items-center justify-center">
                <span className="text-red-400 text-[10px] font-korean text-center leading-tight">
                  관인
                  <br />
                  생략
                </span>
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-3">
              {[
                { label: "성명", placeholder: "________________" },
                { label: "생년월일", placeholder: "____년 __월 __일" },
                { label: "국적", placeholder: "________________" },
                { label: "주소", placeholder: "________________" },
              ].map((field, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-700 font-korean w-16 flex-shrink-0">
                    {field.label}
                  </span>
                  <span className="flex-1 text-xs text-gray-300 border-b border-gray-200 pb-1 font-korean">
                    {field.placeholder}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tax notice */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Document header */}
          <div className="bg-blue-50 border-b border-blue-100 px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-blue-400 tracking-wider font-korean">
              국세청
            </span>
            <span className="text-lg">📋</span>
          </div>

          <div className="p-5">
            <h3 className="text-center font-bold font-korean text-gray-900 mb-4">
              세금 고지서
            </h3>

            <div className="space-y-4">
              {/* Amount */}
              <div className="text-center py-3 bg-red-50 rounded-lg">
                <p className="text-xs text-gray-500 font-korean mb-1">
                  납부 금액
                </p>
                <p className="text-2xl font-bold text-red-600">₩15,000</p>
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-korean">납부기한</span>
                  <span className="font-medium font-korean">
                    2026년 3월 15일
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-korean">세목</span>
                  <span className="font-medium font-korean">소득세</span>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-[11px] text-yellow-800 font-korean leading-relaxed">
                  ⚠️ 기한 내 미납 시 가산세가 부과됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Link
          to="/prototype/v2/work?tab=admin"
          className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
        >
          직접 해보기 →
        </Link>
      </div>
    </SectionWrapper>
  );
}
