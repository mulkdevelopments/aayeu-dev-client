import CTAButton from "@/components/_common/CTAButton";
import AddMoneyWalletDialog from "@/components/_dialogs/AddMoneyWalletDialog";
import React from "react";

function SavedWalletsPage() {
  const transactions = [
    {
      sr: 1,
      date: "01 May 2025",
      remark: "Amount Added to Wallet",
      credit: "AED 1,249.00",
      debit: "",
    },
    {
      sr: 2,
      date: "05 May 2025",
      remark: "Amount Spent",
      credit: "",
      debit: "AED 599.00",
    },
    {
      sr: 3,
      date: "10 July 2025",
      remark: "Amount Spent",
      credit: "",
      debit: "AED 899.00",
    },
    {
      sr: 4,
      date: "15 July 2025",
      remark: "Amount Added to Wallet",
      credit: "AED 2,149.00",
      debit: "",
    },
  ];

  return (
    <div className="max-w-[1250px] mx-auto">
      {/* Wallet Header */}
      <div className="bg-white border p-4 mb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h5 className="font-light text-lg">Wallet</h5>
          </div>
          <div className="font-semibold text-gray-800">Amount AED 1,299</div>
        </div>
      </div>

      <div className="my-4">
        <AddMoneyWalletDialog />
      </div>

      {/* Transaction History */}
      <div className="my-5">
        <h4 className="mb-3 font-light text-lg">Transaction History</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-yellow-700 text-white">
              <tr>
                <th className="py-2 px-3 border">Sr. No</th>
                <th className="py-2 px-3 border">Date</th>
                <th className="py-2 px-3 border text-start">Remark</th>
                <th className="py-2 px-3 border">Credit Amount</th>
                <th className="py-2 px-3 border">Debit Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.sr}
                  className="border-b border-gray-300 text-center"
                >
                  <td className="py-2 px-3">{tx.sr}</td>
                  <td className="py-2 px-3">{tx.date}</td>
                  <td className="py-2 px-3 text-start">{tx.remark}</td>
                  <td className="py-2 px-3">{tx.credit}</td>
                  <td className="py-2 px-3">{tx.debit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SavedWalletsPage;
