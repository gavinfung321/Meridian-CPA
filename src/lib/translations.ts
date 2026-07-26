export type Language = "en" | "zh";

export const translations = {
  en: {
    nav: {
      services: "Services",
      bookConsult: "Book a Consultation",
    },
    hero: {
      title: "Statutory Audits & Corporate Advisory for Hong Kong Enterprises",
      subtitle: "Trusted expertise in audit, tax, and corporate advisory — serving Hong Kong businesses since 2005.",
      description: "We partner with companies across Hong Kong and the Greater Bay Area to deliver rigorous statutory compliance and strategic financial insight.",
    },
    welcome: {
      title: "Welcome to Meridian CPA & Advisory",
      p1: "Meridian CPA & Advisory is a trusted Hong Kong accounting firm delivering expert audit, tax, and business advisory services. Beyond basic compliance, we serve as strategic partners dedicated to protecting your financial integrity and driving sustainable growth.",
      p2: "We pair deep local regulatory knowledge with international accounting standards to support businesses of all sizes. Our team of certified accountants offers clear, actionable insights to help you navigate complex financial landscapes with confidence.",
      btn: "Book a Consultation",
    },
    offer: {
      title: "What We Offer",
      services: [
        "Compliance (Audit & Tax)",
        "Profits Tax Return & Advisory",
        "HKFRS / SME-FRS Bookkeeping",
        "Company Secretarial",
        "Cloud Accounting (Xero)",
        "+more",
      ],
      btn: "Services",
    },
    clients: {
      title: "Hear From Our Clients",
      subtitle: "We believe that our clients' experiences speak volumes about the quality of our services. Here's what some of them have to say:",
      testimonials: [
        {
          quote: '"Meridian CPA handled our transition to Xero cloud accounting seamlessly. Their team is exceptionally responsive and saved us countless hours of manual bookkeeping."',
          author: "— Kenji L., Tech Startup Founder",
        },
        {
          quote: '"Their statutory audit service is thorough, professional, and completed well ahead of the IRD deadlines. Highly recommended for any local SME."',
          author: "— Mrs. Wong, Trading Company Director",
        },
        {
          quote: '"Setting up our Hong Kong subsidiary was effortless thanks to their corporate secretarial team. They handle all our annual filings perfectly."',
          author: "— Marcus S., Overseas Investor",
        },
      ],
      callout: "Let us help you navigate your compliance journey with confidence and peace of mind. Contact Meridian CPA today.",
      btn: "Schedule a Consult",
    },
    footer: {
      tagline: "Deep expertise, decisive financial clarity",
      email: "info@meridiancpa.com.hk",
      phone: "+852 2815 1234",
      address: [
        "Suite 1801, 18/F, Chinachem Tower",
        "34-37 Connaught Road Central",
        "Central, Hong Kong",
      ],
      license: "TCSP License No. TC001234 | AFRC Registered Practice",
      rights: "Meridian CPA & Advisory\n© 2026 All Rights Reserved",
    },
    people: {
      label: "OUR LEADERSHIP TEAM",
      title: "The Partners",
      subtitle: "HKICPA Practising CPAs with deep expertise across audit, tax, and cross-border advisory.",
      partners: [
        {
          name: "Andrew Lam",
          title: "Managing Partner",
          specialty: "International Liaison & Practice Director",
          bio: "Andrew leads the firm's strategic direction with over 20 years of experience in statutory audit and international corporate structuring. He serves as the primary liaison for multinational clients operating across the Greater Bay Area.",
          initials: "AL",
        },
        {
          name: "Cecilia Yam",
          title: "Director",
          specialty: "Risk Management & Compliance",
          bio: "Cecilia heads the firm's risk management practice, overseeing quality control across all audit engagements. She holds specialist qualifications in AFRC regulatory compliance and internal audit frameworks.",
          initials: "CY",
        },
        {
          name: "Ringo Chiu",
          title: "Director — Tax Services",
          specialty: "IRD Corporate Tax Division",
          bio: "Ringo leads the tax advisory team with deep expertise in Hong Kong Profits Tax and cross-border tax structuring. He manages the firm's relationship with IRD and advises clients on complex tax investigations.",
          initials: "RC",
        },
        {
          name: "Wing Chan",
          title: "Director",
          specialty: "China & Cross-Border Practice",
          bio: "Wing spearheads the firm's Greater China advisory practice, supporting inbound and outbound investment structures between Hong Kong, Mainland China, and Southeast Asia. She is fluent in Cantonese, Mandarin, and English.",
          initials: "WC",
        },
      ],
    },
    timeline: {
      label: "OUR PROCESS",
      title: "The Audit Lifecycle",
      subtitle: "A structured, transparent engagement from day one to signed report.",
      steps: [
        {
          number: "01",
          title: "Engagement & Scope",
          description: "We define the audit mandate, understand your business context, and agree on timelines and key deliverables with management.",
        },
        {
          number: "02",
          title: "Planning & Risk Assessment",
          description: "We identify material areas, assess inherent and control risks, and design audit procedures tailored to your industry.",
        },
        {
          number: "03",
          title: "Fieldwork & Evidence",
          description: "On-site or remote sampling, substantive testing, and documentation of evidence in compliance with HKSA standards.",
        },
        {
          number: "04",
          title: "Findings & Review",
          description: "We present findings to management, discuss any control gaps, and address queries before finalising our conclusions.",
        },
        {
          number: "05",
          title: "Report & Signing",
          description: "We issue the signed statutory audit report and financial statements, ready for submission to Companies Registry and IRD.",
        },
        {
          number: "06",
          title: "Post-Audit Advisory",
          description: "Strategic recommendations, lessons learned, and year-round support to strengthen controls for the next cycle.",
        },
      ],
    },
    methodology: {
      label: "OUR METHODOLOGY",
      title: "Rigour at every stage",
      subtitle: "Our audit approach is built on six core principles that ensure accuracy, independence, and genuine value for your business.",
      pillars: [
        {
          icon: "risk",
          title: "Risk-Based Approach",
          description: "We focus resources where material misstatements are most likely, ensuring depth of scrutiny where it matters most.",
        },
        {
          icon: "independence",
          title: "Independence & Objectivity",
          description: "Strict ethical walls, engagement partner rotation, and documented independence confirmations on every engagement.",
        },
        {
          icon: "standards",
          title: "HKSA Compliance",
          description: "Every procedure is designed and documented in full compliance with Hong Kong Standards on Auditing issued by HKICPA.",
        },
        {
          icon: "technology",
          title: "Technology-Enhanced",
          description: "We leverage CaseWare, Xero, and data analytics tools to accelerate fieldwork and improve evidence coverage.",
        },
        {
          icon: "communication",
          title: "Clear Communication",
          description: "Findings are communicated in plain language at every stage — no jargon, no surprises at the reporting stage.",
        },
        {
          icon: "quality",
          title: "Quality Review",
          description: "All engagements undergo a mandatory quality control review by an engagement quality reviewer before the report is signed.",
        },
      ],
    },
  },
  zh: {
    nav: {
      services: "服務項目",
      bookConsult: "預約諮詢",
    },
    hero: {
      title: "香港企業法定審計及企業諮詢服務",
      subtitle: "誠信專業的審計、稅務及企業諮詢服務 — 自2005年起深耕香港。",
      description: "我們與香港及大灣區的企業合作，提供嚴謹的法定合規及策略性財務洞察。",
    },
    welcome: {
      title: "歡迎來到 Meridian CPA & Advisory",
      p1: "Meridian CPA & Advisory 是您值得信賴的香港會計師事務所，提供專業的審計、稅務和商業諮詢服務。除了基本的合規性，我們更是您致力於維護財務誠信與推動可持續增長的策略夥伴。",
      p2: "我們將深厚的本地法規知識與國際會計準則相結合，為各種規模的企業提供支持。我們的執業會計師團隊提供清晰、具可操作性的見解，助您信心十足地應對複雜的財務局勢。",
      btn: "預約諮詢",
    },
    offer: {
      title: "服務範圍",
      services: [
        "合規服務 (審計與稅務)",
        "利得稅申報及諮詢",
        "香港財務報告準則 / 中小企業財務報告準則簿記",
        "公司秘書服務",
        "雲端會計 (Xero)",
        "查看全部",
      ],
      btn: "服務項目",
    },
    clients: {
      title: "客戶見證",
      subtitle: "我們深信客戶的親身體驗最能展現我們的服務品質。以下是部分客戶的真誠分享：",
      testimonials: [
        {
          quote: "「Meridian CPA 協助我們無縫過渡到 Xero 雲端會計。他們的團隊回覆極快，為我們節省了無數的手動簿記時間。」",
          author: "— Kenji L.，科技初創企業創辦人",
        },
        {
          quote: "「審計服務嚴謹且專業，並在稅務局截止日期前妥善完成。極力推薦給本地中小企業。」",
          author: "— 王太太，貿易公司董事",
        },
        {
          quote: "「非常感謝他們的秘書團隊，讓我們成立香港子公司變得輕鬆簡單。他們完美處理了我們所有的年度申報。」",
          author: "— Marcus S.，海外投資者",
        },
      ],
      callout: "讓我們協助您信心十足、無憂無慮地步入合規之旅。今天就聯絡 Meridian CPA。",
      btn: "預約諮詢",
    },
    footer: {
      tagline: "深厚專業，精準的財務洞察",
      email: "info@meridiancpa.com.hk",
      phone: "+852 2815 1234",
      address: [
        "香港中環干諾道中34-37號",
        "華懋大廈18樓1801室",
      ],
      license: "信託或公司服務提供者牌照編號 TC001234 | 會計及財務匯報局註冊事務所",
      rights: "Meridian CPA & Advisory\n© 2026 版權所有",
    },
    people: {
      label: "我們的領導團隊",
      title: "合夥人",
      subtitle: "持牌香港執業會計師，在審計、稅務及跨境諮詢方面擁有深厚專業。",
      partners: [
        {
          name: "林偉明",
          title: "管理合夥人",
          specialty: "國際聯絡及業務總監",
          bio: "林先生擁有超過20年法定審計及國際企業架構經驗，主導事務所的策略方向，並擔任在大灣區業務的跨國客戶的首要聯絡人。",
          initials: "林",
        },
        {
          name: "任慧芬",
          title: "董事",
          specialty: "風險管理及合規",
          bio: "任女士領導事務所的風險管理實務，監督所有審計業務的質量控制，並持有AFRC合規及內部審計框架的專業資格。",
          initials: "任",
        },
        {
          name: "趙榮光",
          title: "董事 — 稅務服務",
          specialty: "稅務局企業稅務部門",
          bio: "趙先生領導稅務諮詢團隊，在香港利得稅及跨境稅務架構方面擁有深厚專業，並代表客戶處理複雜的稅務調查事宜。",
          initials: "趙",
        },
        {
          name: "陳詠珊",
          title: "董事",
          specialty: "中國及跨境業務",
          bio: "陳女士主導事務所的大中華諮詢業務，為香港、中國內地及東南亞之間的入境及外出投資架構提供支援，通曉廣東話、普通話及英語。",
          initials: "陳",
        },
      ],
    },
    timeline: {
      label: "我們的流程",
      title: "審計全週期",
      subtitle: "從第一天到簽署報告，結構清晰、透明有序的審計服務。",
      steps: [
        {
          number: "01",
          title: "委任及範圍",
          description: "界定審計委任範圍，了解您的業務背景，並與管理層就時間表及主要交付物達成共識。",
        },
        {
          number: "02",
          title: "規劃及風險評估",
          description: "識別重大領域，評估固有及控制風險，並根據您的行業設計針對性的審計程序。",
        },
        {
          number: "03",
          title: "實地工作及取證",
          description: "按照香港審計準則，進行現場或遙距抽樣、實質性測試及審計憑證文件記錄。",
        },
        {
          number: "04",
          title: "發現事項及審閱",
          description: "向管理層呈報發現事項，討論任何內控缺口，並在定稿前解答相關疑問。",
        },
        {
          number: "05",
          title: "報告及簽署",
          description: "發出已簽署的法定審計報告及財務報表，可提交公司註冊處及稅務局。",
        },
        {
          number: "06",
          title: "審計後諮詢",
          description: "提供策略建議、經驗總結及全年支援，以加強內控措施，為下一個審計週期做好準備。",
        },
      ],
    },
    methodology: {
      label: "我們的方法論",
      title: "每個環節均嚴謹把關",
      subtitle: "我們的審計方法建基於六大核心原則，確保準確、獨立，並為您的業務帶來真正價值。",
      pillars: [
        {
          icon: "risk",
          title: "風險為本",
          description: "我們將資源集中於最可能出現重大失實陳述的領域，確保在最關鍵的地方深入審查。",
        },
        {
          icon: "independence",
          title: "獨立及客觀",
          description: "嚴格的道德隔離、業務合夥人輪換制度，以及每次委任均有書面獨立性確認。",
        },
        {
          icon: "standards",
          title: "遵守香港審計準則",
          description: "所有程序均按照香港會計師公會發布的香港審計準則設計及記錄。",
        },
        {
          icon: "technology",
          title: "科技輔助",
          description: "我們採用CaseWare、Xero及數據分析工具，加快實地工作並提升審計憑證覆蓋範圍。",
        },
        {
          icon: "communication",
          title: "清晰溝通",
          description: "在每個階段均以淺白語言傳達發現事項——無專業術語，報告階段不會有任何意外。",
        },
        {
          icon: "quality",
          title: "質量審閱",
          description: "所有委任在簽署報告前，均須由業務質量審閱員進行強制性質量控制審閱。",
        },
      ],
    },
  },
};
