import { Globe, MonitorSmartphone } from "lucide-react";
import { Button } from "./ui/button";

export default function DeviceCard({ name, type, request }: { name: string, type: "remove" | "add", request(id: string): void }) {
    return (
        <div className="flex w-full items-center justify-center gap-2">
            <div className="flex flex-1 items-center gap-4 min-w-0">
                <MonitorSmartphone
                    size={24}
                    color="#0769e1e8"
                    className="shrink-0 p-3 box-content bg-[#0769e152] rounded-md"
                />
                <p className="truncate min-w-0">{name}</p>
            </div>
            <Button
                variant={type == "add" ? "default" : "destructive"}
                className={`cursor-pointer ${type == "add" ? "bg-green-600" : ""}`}
                onClick={() => request("id")}
            >
                {type == "add" ? "+" : "x"}
            </Button>
        </div>
    )
}