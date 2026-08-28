export type Session = {
  id: string;
  titleKey: string;
  tagsKey: string;
  locationKey: string;
  day: string;
  time: string;
  duration: number; // in mins
  capacity: { booked: number; total: number };
  isPrivate: boolean; // capacity = 1
  ctaTextKey: string;
  typeFilter: "taxPlanning" | "auditCompliance" | "payrollMpf" | "advisory";
  locationFilter: "centralOffice" | "onlineZoom" | "clientSite";
};

export const MOCK_SESSIONS: Session[] = [
  {
    id: "tax-planning-1",
    titleKey: "booking.sessions.taxPlanning.title",
    tagsKey: "booking.sessions.taxPlanning.tags",
    locationKey: "booking.locations.centralZoom",
    day: "Monday",
    time: "10:00",
    duration: 60,
    capacity: { booked: 1, total: 1 },
    isPrivate: true,
    ctaTextKey: "booking.card.bookConsultation",
    typeFilter: "taxPlanning",
    locationFilter: "centralOffice",
  },
  {
    id: "ptr-clinic-1",
    titleKey: "booking.sessions.ptrClinic.title",
    tagsKey: "booking.sessions.ptrClinic.tags",
    locationKey: "booking.locations.boardroomHybrid",
    day: "Tuesday",
    time: "15:00",
    duration: 45,
    capacity: { booked: 5, total: 8 },
    isPrivate: false,
    ctaTextKey: "booking.card.reserveSpot",
    typeFilter: "auditCompliance",
    locationFilter: "centralOffice",
  },
  {
    id: "mpf-masterclass-1",
    titleKey: "booking.sessions.mpfMasterclass.title",
    tagsKey: "booking.sessions.mpfMasterclass.tags",
    locationKey: "booking.locations.onlineWebinar",
    day: "Wednesday",
    time: "14:00",
    duration: 60,
    capacity: { booked: 8, total: 20 },
    isPrivate: false,
    ctaTextKey: "booking.card.registerNow",
    typeFilter: "payrollMpf",
    locationFilter: "onlineZoom",
  },
  {
    id: "audit-readiness-1",
    titleKey: "booking.sessions.auditReadiness.title",
    tagsKey: "booking.sessions.auditReadiness.tags",
    locationKey: "booking.locations.centralOffice",
    day: "Thursday",
    time: "11:00",
    duration: 45,
    capacity: { booked: 0, total: 1 },
    isPrivate: true,
    ctaTextKey: "booking.card.bookAuditReview",
    typeFilter: "auditCompliance",
    locationFilter: "centralOffice",
  },
  {
    id: "gba-structuring-1",
    titleKey: "booking.sessions.gbaStructuring.title",
    tagsKey: "booking.sessions.gbaStructuring.tags",
    locationKey: "booking.locations.hybrid",
    day: "Friday",
    time: "16:00",
    duration: 90,
    capacity: { booked: 10, total: 15 },
    isPrivate: false,
    ctaTextKey: "booking.card.reserveSpot",
    typeFilter: "advisory",
    locationFilter: "onlineZoom",
  }
];
