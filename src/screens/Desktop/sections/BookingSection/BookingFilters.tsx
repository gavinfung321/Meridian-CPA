import { Filter, ChevronDown } from "lucide-react";
import { Language, translations } from "../../../../lib/translations";

export type SessionTypeFilter = "all" | "taxPlanning" | "auditCompliance" | "payrollMpf" | "advisory";
export type SessionLocationFilter = "all" | "centralOffice" | "onlineZoom" | "clientSite";

type BookingFiltersProps = {
  lang: Language;
  typeFilter: SessionTypeFilter;
  setTypeFilter: (val: SessionTypeFilter) => void;
  locationFilter: SessionLocationFilter;
  setLocationFilter: (val: SessionLocationFilter) => void;
};

// Helper to resolve nested keys
const resolvePath = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

export const BookingFilters = ({
  lang,
  typeFilter,
  setTypeFilter,
  locationFilter,
  setLocationFilter,
}: BookingFiltersProps) => {
  const t = translations[lang];

  return (
    <div className="flex flex-col md:flex-row justify-start items-center gap-4 mb-8">
      <div className="flex items-center text-sm font-medium text-[#2C3E35] px-2 py-2 shrink-0">
        <Filter className="w-4 h-4 mr-2 text-gray-500" />
        Filters:
      </div>
      
      <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
        <div className="relative min-w-[200px]">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as SessionTypeFilter)}
            className="appearance-none w-full bg-white text-[#2C3E35] border border-[#EDECE6] text-sm rounded-lg px-4 py-2.5 pr-10 outline-none focus:border-[#C9A84C] transition-colors"
          >
            <option value="all">{resolvePath(t, "booking.filters.allTypes")}</option>
            <option value="taxPlanning">{resolvePath(t, "booking.filters.taxPlanning")}</option>
            <option value="auditCompliance">{resolvePath(t, "booking.filters.auditCompliance")}</option>
            <option value="payrollMpf">{resolvePath(t, "booking.filters.payrollMpf")}</option>
            <option value="advisory">{resolvePath(t, "booking.filters.advisory")}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative min-w-[180px]">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value as SessionLocationFilter)}
            className="appearance-none w-full bg-white text-[#2C3E35] border border-[#EDECE6] text-sm rounded-lg px-4 py-2.5 pr-10 outline-none focus:border-[#C9A84C] transition-colors"
          >
            <option value="all">{resolvePath(t, "booking.filters.allLocations")}</option>
            <option value="centralOffice">{resolvePath(t, "booking.filters.centralOffice")}</option>
            <option value="onlineZoom">{resolvePath(t, "booking.filters.onlineZoom")}</option>
            <option value="clientSite">{resolvePath(t, "booking.filters.clientSite")}</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
