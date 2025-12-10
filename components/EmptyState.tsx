import { FileTextIcon } from "@radix-ui/react-icons";

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center mt-12">
      <div className="flex flex-col items-center gap-3 opacity-50">
        <div className="w-16 h-16 flex items-center justify-center">
          <FileTextIcon className="w-8 h-8" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h3 className="font-medium text-lg">No tickets</h3>
          <p className="text-sm opacity-70">
            Create a new ticket to get started
          </p>
        </div>
      </div>
    </div>
  );
}
