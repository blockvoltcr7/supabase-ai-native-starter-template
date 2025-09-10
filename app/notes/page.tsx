import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function Page() {
  const supabase = await createClient();

  const { data: notes, error } = await supabase.from("notes").select();

  // Derive columns dynamically from the first row so this works with any schema
  const columns = Array.isArray(notes) && notes.length > 0 ? Object.keys(notes[0]!) : [];

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            {error ? "There was an error fetching your notes." : `${notes?.length ?? 0} note${(notes?.length ?? 0) === 1 ? "" : "s"} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <pre className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error.message}
            </pre>
          ) : !notes || notes.length === 0 ? (
            <div className="text-muted-foreground text-sm">No notes found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col} className="capitalize">{col.replace(/_/g, " ")}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((row: Record<string, any>, idx: number) => (
                  <TableRow key={idx}>
                    {columns.map((col) => (
                      <TableCell key={col}>{formatCell(row[col])}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatCell(value: unknown) {
  if (value == null) return "";
  // Render objects/arrays as JSON, try to format ISO dates nicely
  if (typeof value === "string") {
    const maybeDate = new Date(value);
    if (!isNaN(maybeDate.getTime()) && /\d{4}-\d{2}-\d{2}T/.test(value)) {
      return maybeDate.toLocaleString();
    }
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
