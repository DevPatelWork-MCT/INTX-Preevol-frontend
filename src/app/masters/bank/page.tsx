"use client";

import { useEffect, useState } from "react";
import { useBankApi } from "@/hooks/useBankApi";
import { DataTable } from "@/components/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BankPage() {
  const { listBanks, loading, error } = useBankApi();
  const [banks, setBanks] = useState<any[]>([]);

  useEffect(() => {
    listBanks()
      .then((data) => setBanks(data))
      .catch(() => {});
  }, [listBanks]);

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Banks</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error loading banks</p>}
        <DataTable data={banks} />
        <Button className="mt-4">Add Bank</Button>
      </CardContent>
    </Card>
  );
}
