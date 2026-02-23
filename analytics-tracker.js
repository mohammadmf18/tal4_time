// analytics-tracker.js
// ملف مساعد لتتبع الأحداث والزوار في جميع صفحات المشروع

// ==============================================
// تهيئة التتبع
// ==============================================

const AnalyticsTracker = {
    // معرف Google Analytics الخاص بك
    GA_ID: 'G-WT18TH9QLV', // استبدل بمعرفك الحقيقي
    
    // تتبع زيارة الصفحة
    trackPageView: function(pageName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: pageName,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
        
        // حفظ في localStorage أيضاً للتتبع المحلي
        this.saveLocalVisit(pageName);
    },
    
    // تتبع حدث مخصص
    trackEvent: function(eventName, eventParams = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventParams);
        }
        
        console.log('Event Tracked:', eventName, eventParams);
    },
    
    // تتبع استخدام الحاسبة
    trackCalculatorUsage: function(requiredHours, actualHours) {
        this.trackEvent('calculator_used', {
            required_hours: requiredHours,
            actual_hours: actualHours,
            status: actualHours >= requiredHours ? 'complete' : 'incomplete'
        });
    },
    
    // تتبع تحليل التقرير
    trackReportAnalysis: function(employeeName, totalDays) {
        this.trackEvent('report_analyzed', {
            employee_name: employeeName,
            total_days: totalDays
        });
    },
    
    // تتبع النقرات على الأزرار
    trackButtonClick: function(buttonName) {
        this.trackEvent('button_click', {
            button_name: buttonName
        });
    },
    
    // حفظ الزيارة محلياً (للتتبع بدون إنترنت)
    saveLocalVisit: function(pageName) {
        const visits = JSON.parse(localStorage.getItem('site_visits') || '[]');
        
        visits.push({
            page: pageName,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language
        });
        
        // احتفظ بآخر 1000 زيارة فقط
        if (visits.length > 1000) {
            visits.shift();
        }
        
        localStorage.setItem('site_visits', JSON.stringify(visits));
    },
    
    // الحصول على إحصائيات محلية
    getLocalStats: function() {
        const visits = JSON.parse(localStorage.getItem('site_visits') || '[]');
        
        // تجميع البيانات
        const stats = {
            totalVisits: visits.length,
            pageViews: {},
            todayVisits: 0,
            weekVisits: 0
        };
        
        const today = new Date().toDateString();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        visits.forEach(visit => {
            // عدد الزيارات لكل صفحة
            stats.pageViews[visit.page] = (stats.pageViews[visit.page] || 0) + 1;
            
            // زيارات اليوم
            const visitDate = new Date(visit.timestamp);
            if (visitDate.toDateString() === today) {
                stats.todayVisits++;
            }
            
            // زيارات الأسبوع
            if (visitDate >= weekAgo) {
                stats.weekVisits++;
            }
        });
        
        return stats;
    },
    
    // مسح البيانات المحلية
    clearLocalData: function() {
        localStorage.removeItem('site_visits');
    }
};

// ==============================================
// Auto-tracking للأحداث الشائعة
// ==============================================

// تتبع تلقائي عند تحميل الصفحة
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // تحديد اسم الصفحة من العنوان
        const pageName = document.title || 'Unknown Page';
        AnalyticsTracker.trackPageView(pageName);
        
        // تتبع النقرات على جميع الأزرار
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                const buttonText = this.textContent.trim().substring(0, 50);
                AnalyticsTracker.trackButtonClick(buttonText);
            });
        });
        
        // تتبع النقرات على الروابط الخارجية
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            link.addEventListener('click', function() {
                AnalyticsTracker.trackEvent('external_link_click', {
                    url: this.href
                });
            });
        });
    });
    
    // تتبع وقت البقاء في الصفحة
    let pageStartTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
        AnalyticsTracker.trackEvent('time_on_page', {
            duration_seconds: timeSpent,
            page: document.title
        });
    });
}

// تصدير للاستخدام في الملفات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsTracker;
}
