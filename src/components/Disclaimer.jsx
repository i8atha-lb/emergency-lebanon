function Disclaimer() {
  // Always visible - cannot be dismissed

  return (
    <div className="disclaimer">
      <div className="container disclaimer-container">
        <div className="disclaimer-icon">⚠️</div>
        <div className="disclaimer-content">
          <h3 className="disclaimer-title">
            تنبيه قانوني مهم
          </h3>
          <p className="disclaimer-text">
            <strong>المنصة لا تتحمل أي مسؤولية</strong> عن المعلومات المنشورة من قبل المستخدمين.
            يرجى <strong>التحقق من صحة جميع الأرقام والمعلومات</strong> قبل الاتصال أو الذهاب إلى أي مكان.
          </p>
          <p className="disclaimer-text">
            نوصي بشدة بالتواصل مع الجهات الرسمية (الدفاع المدني، الصليب الأحمر) للتأكد من المعلومات.
          </p>
          <p className="disclaimer-text">
            هذه المنصة غير تابعة للحكومة اللبنانية، وهي مبادرة فردية ينفذها متطوعون وأفراد.
          </p>
          <p className="disclaimer-text">
            🚩 <strong>نشجعك على الإبلاغ عن أي منشورات</strong> تعتقد أنها كاذبة أو مزعجة أو تحاول الاستغلال.
            سيتم حذف المنشورات تلقائياً عند الإبلاغ عنها 3 مرات.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Disclaimer
