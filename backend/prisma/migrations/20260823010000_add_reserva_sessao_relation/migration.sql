-- Add the missing relation between reservations and sessions.
ALTER TABLE "Reserva"
ADD CONSTRAINT "Reserva_sessaoId_fkey"
FOREIGN KEY ("sessaoId") REFERENCES "Sessao"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
