DO $$
BEGIN
  -- Create table if it doesn't exist (preserves quoted identifier case)
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Whiteboard' AND relkind = 'r') THEN
    CREATE TABLE "Whiteboard" (
      "id" TEXT NOT NULL,
      "workspaceId" TEXT NOT NULL,
      "elements" JSONB NOT NULL DEFAULT '[]',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Whiteboard_pkey" PRIMARY KEY ("id")
    );
  END IF;

  -- Create unique index if missing
  IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE c.relkind = 'i' AND c.relname = 'Whiteboard_workspaceId_key') THEN
    CREATE UNIQUE INDEX "Whiteboard_workspaceId_key" ON "Whiteboard"("workspaceId");
  END IF;

  -- Add FK constraint if missing
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Whiteboard_workspaceId_fkey') THEN
    ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END
$$;
