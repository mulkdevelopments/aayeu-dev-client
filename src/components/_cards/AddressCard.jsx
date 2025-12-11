"use client";

import CTAButton from "../_common/CTAButton";

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  radioMode = false, // toggle radio mode
  name,
  selected,
  onSelect,
}) {
  const {
    label,
    street,
    city,
    state,
    postal_code,
    country,
    mobile,
    is_default,
  } = address;

  const line1 = `${street}, ${city}, ${state} - ${postal_code}`;
  const line2 = country;

  return (
    <div
      className={`relative bg-white border p-5 mt-3 ${
        radioMode ? "flex justify-between items-center" : ""
      }`}
    >
      {radioMode ? (
        <>
          {/* Left side: address info */}
          <div>
            <h6 className="font-semibold text-gray-800">{label}</h6>
            <p className="text-sm text-gray-700">{line1}</p>
            <p className="text-sm text-gray-700">{line2}</p>
            <p className="text-sm text-gray-700">Mobile: {mobile}</p>
          </div>

          {/* Right side: radio button */}
          <input
            type="radio"
            name={name}
            checked={selected}
            onChange={onSelect}
          />
        </>
      ) : (
        <>
          {/* Top Right Actions */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <CTAButton variant="outline" color="neutral" onClick={onEdit}>
                Edit
              </CTAButton>
              {!is_default && (
                <CTAButton variant="outline" color="danger" onClick={onDelete}>
                  Delete
                </CTAButton>
              )}
            </div>
            {is_default && (
              <span className="mt-2 text-xs font-semibold bg-yellow-400 text-black px-2 py-1 rounded-md">
                Default
              </span>
            )}
          </div>

          {/* Address Content */}
          <div className="pr-32">
            <div className="flex items-center gap-2 mb-2">
              <h6 className="font-semibold text-lg text-gray-800">{label}</h6>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{line1}</p>
            <p className="text-gray-700 text-sm mb-3">{line2}</p>
            <div className="flex items-center gap-2 text-gray-800 text-sm">
              Mobile: <span>{mobile}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
