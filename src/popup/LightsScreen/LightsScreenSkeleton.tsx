import classNames from "classnames";

export function LightsScreenSkeleton() {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-grow-0 px-5 py-5">
        <div className="flex space-x-3 w-full justify-between animate-pulse">
          <div className="flex px-4 py-4 w-full justify-between bg-zinc-900 rounded-xl"></div>
          <div className="">
            <button
              title="options"
              className="px-4 transition-colors flex-grow-0 flex-1 py-4 bg-zinc-900 rounded-xl w-full h-full flex items-center justify-center hover:bg-zinc-700"
            >
              <div className="stroke-current w-6 h-6"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-grow-0 px-5 py-5 shadow-2xl animate-pulse opacity-50">
        <div className="relative flex flex-col px-4 pb-4 pt-8 w-full bg-zinc-900 rounded-xl">
          <div className="inline-block bg-zinc-800 px-4 py-[5px] font-bold absolute -translate-y-12 rounded-full">
            <span className="opacity-0">Something</span>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-1 w-full justify-between">
              <div className="text-sm font-semibold">
                <span className="opacity-0">Label</span>
              </div>

              <div className="relative flex w-full">
                <div className="absolute inset-0 rounded-full bg-[#121116]"></div>
                <button
                  className={classNames(
                    "min-w-fit h-11 rounded-full flex items-center px-2 w-full bg-zinc-800 relative"
                  )}
                >
                  <div className="absolute hover:opacity-60 transotion transition-opacity inset-0 bg-black opacity-70 rounded-full"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
