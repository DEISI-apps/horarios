import { createEvents } from "ics";

export async function GET() {
  const events = [
    {
      title: "Interfaces Web",
      start: [2025, 9, 9, 12, 0], // ano, mês, dia, hora, minuto
      end: [2025, 9, 9, 13, 30],
      description: "Aula semanal de 12h a 13h30",
      location: "Sala S.11",
      recurrenceRule: "FREQ=WEEKLY;COUNT=15;BYDAY=TU",
    }
  ];

  return new Promise((resolve) => {
    createEvents(events, (error, value) => {
      if (error) {
        resolve(new Response(JSON.stringify({ error: error.message }), { status: 500 }));
      } else {
        // Convert the string to a Blob-like structure
        const file = new TextEncoder().encode(value);

        resolve(
          new Response(file, {
            status: 200,
            headers: {
              "Content-Type": "text/calendar; charset=utf-8",
              "Content-Disposition": "attachment; filename=events.ics",
            },
          })
        );
      }
    });
  });
}
