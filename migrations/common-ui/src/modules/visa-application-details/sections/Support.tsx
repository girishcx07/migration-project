"use client";

const Support = ({ email }: { email: string }) => {
  return (
    <div className="relative h-full w-full flex-col rounded-lg bg-white p-5 shadow-[1px_1px_3px_rgba(0,0,0,0.2)]"  >
      <div className="flex h-full flex-col items-center justify-center">
        <h4 className=""> Support </h4>
        <div className="flex gap-1">

          {email ?
            (<> <span className="text-sm">Contact us at {" "}
              <a
                // href="https://visaero.com/terms-of-use.html"
                href={`mailto:${email?.trim()}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {email}
              </a>
            </span>
            </>) :
            <span className="text-sm">Please contact the administrator.</span>
          }
        </div>
      </div>
    </div>
  );
};

export default Support;
