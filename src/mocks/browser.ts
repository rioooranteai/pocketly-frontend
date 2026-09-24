import { setupWorker } from "msw/browser";

import { resetMockDb } from "@/mocks/db";
import { handlers } from "@/mocks/handlers";

export const worker = setupWorker(...handlers);

// Console helper while reviewing: `pocketlyMock.reset()` then reload.
declare global {
  interface Window {
    pocketlyMock?: { reset: () => void };
  }
}
window.pocketlyMock = { reset: resetMockDb };
