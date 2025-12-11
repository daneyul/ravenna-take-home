import { expect, test } from "@playwright/test";

test.describe("Tickets Page", () => {
  test("should redirect from home to tickets page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/tickets");
  });

  test("should display the header", async ({ page }) => {
    await page.goto("/tickets");
    await page.waitForLoadState("networkidle");

    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("should display the board", async ({ page }) => {
    await page.goto("/tickets");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle(/Ravenna/i);
  });

  test("should create a new ticket with all required fields", async ({ page }) => {
    await page.goto("/tickets");
    await page.waitForLoadState("networkidle");

    // Click "New Ticket" button
    await page.getByRole("button", { name: "New Ticket" }).click();

    // Wait for dialog to appear and verify the dialog title
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "New Ticket" })).toBeVisible();

    // Fill in the ticket title
    await dialog.getByPlaceholder("Ticket title").fill("Test ticket from E2E");

    // Select a status - click the status dropdown button
    const statusButton = dialog.getByTestId("status-field").getByRole("button");
    await statusButton.click();

    // Wait for dropdown menu to appear and select "In Progress"
    await page.getByRole("menuitem", { name: "In Progress" }).click();

    // Select an assignee - click the assignee dropdown button
    const assigneeButton = dialog.getByTestId("assignee-field").getByRole("button");
    await assigneeButton.click();

    // Wait for dropdown menu to appear and select the first assignee
    const firstAssignee = page.getByRole("menuitem").filter({ hasText: /@/ }).first();
    await firstAssignee.click();

    // Fill in requester name
    await dialog.getByPlaceholder("Enter name").fill("John Doe");

    // Fill in requester email
    await dialog.getByPlaceholder("Enter email").fill("john.doe@example.com");

    // Click "Create Ticket" button
    await dialog.getByRole("button", { name: "Create Ticket" }).click();

    // Verify toast notification appears
    await expect(page.getByText("Ticket created")).toBeVisible();

    // Verify dialog is closed
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should click on a ticket card and edit the title", async ({ page }) => {
    await page.goto("/tickets");
    await page.waitForLoadState("networkidle");

    // Find and click on the first ticket card
    // The card is wrapped in a Link component with the ticket title as text
    const firstTicketCard = page.getByRole("link").filter({ has: page.locator("h3") }).first();
    await firstTicketCard.click();

    // Wait for navigation to ticket detail page
    await expect(page).toHaveURL(/\/tickets\/.+/);
    await page.waitForLoadState("networkidle");

    // Find the title input field using the aria-label
    const titleInput = page.getByRole("textbox", { name: "Ticket title" });
    await expect(titleInput).toBeVisible();

    // Get the original title value
    const originalTitle = await titleInput.inputValue();

    // Clear and type a new title
    await titleInput.clear();
    await titleInput.fill("Updated ticket title from E2E test");

    // Wait for the debounced save (1 second) and verify toast appears
    await expect(page.getByText("Title saved")).toBeVisible({ timeout: 2000 });

    // Verify the input still has the new value
    await expect(titleInput).toHaveValue("Updated ticket title from E2E test");

    // Navigate back to tickets page
    await page.getByRole("button", { name: "Back to board" }).click();
    await expect(page).toHaveURL("/tickets");

    // Verify the updated title is displayed on the card
    await expect(page.getByRole("heading", { name: "Updated ticket title from E2E test" })).toBeVisible();
  });

  test("should drag a card from one column to another", async ({ page }) => {
    await page.goto("/tickets");
    await page.waitForLoadState("networkidle");

    // Wait a bit for animations to settle
    await page.waitForTimeout(500);

    // Find all visible columns (the board only shows columns with tickets)
    const visibleColumns = await page.getByTestId(/^column-.*-droppable$/).all();

    // We need at least 2 columns to test drag and drop
    if (visibleColumns.length < 2) {
      throw new Error("Not enough columns visible to test drag and drop");
    }

    // Get the first column and find a card in it
    const firstColumn = visibleColumns[0];
    const firstCard = await firstColumn.locator('[data-testid^="ticket-card-"]').first();
    await expect(firstCard).toBeVisible();

    // Get the card's test ID for tracking
    const cardTestId = await firstCard.getAttribute("data-testid");
    if (!cardTestId) throw new Error("Card test ID not found");

    // Use the second visible column as the target
    const targetColumn = visibleColumns[1];

    // Perform the drag and drop
    await firstCard.hover();
    await page.mouse.down();

    // Move the mouse in small steps to trigger the drag (8px minimum from PointerSensor config)
    const cardBox = await firstCard.boundingBox();
    if (!cardBox) throw new Error("Card bounding box not found");

    await page.mouse.move(
      cardBox.x + 10,
      cardBox.y + 10,
      { steps: 5 }
    );

    // Get the target column's bounding box
    const targetBox = await targetColumn.boundingBox();
    if (!targetBox) throw new Error("Target column not found");

    // Move to the center of the target column
    await page.mouse.move(
      targetBox.x + targetBox.width / 2,
      targetBox.y + targetBox.height / 2,
      { steps: 10 }
    );

    // Release the mouse to drop
    await page.mouse.up();

    // Wait for the drag operation to complete
    await page.waitForTimeout(500);

    // Verify the card is now in the target column
    await expect(targetColumn.locator(`[data-testid="${cardTestId}"]`)).toBeVisible();

    // Verify the card is no longer in the first column
    await expect(firstColumn.locator(`[data-testid="${cardTestId}"]`)).not.toBeVisible();
  });

  test("should reorder cards within the same column by dragging", async ({ page }) => {
    await page.goto("/tickets");
    await page.waitForLoadState("networkidle");

    // Wait for animations to settle
    await page.waitForTimeout(500);

    // Find a column with at least 2 cards
    const visibleColumns = await page.getByTestId(/^column-.*-droppable$/).all();

    let columnWithMultipleCards = null;
    for (const column of visibleColumns) {
      const cardCount = await column.locator('[data-testid^="ticket-card-"]').count();
      if (cardCount >= 2) {
        columnWithMultipleCards = column;
        break;
      }
    }

    if (!columnWithMultipleCards) {
      throw new Error("No column found with at least 2 cards to test reordering");
    }

    // Get the first two cards in the column
    const cards = await columnWithMultipleCards.locator('[data-testid^="ticket-card-"]').all();
    const firstCard = cards[0];
    const secondCard = cards[1];

    // Get card IDs for tracking
    const firstCardId = await firstCard.getAttribute("data-testid");
    const secondCardId = await secondCard.getAttribute("data-testid");

    if (!firstCardId || !secondCardId) throw new Error("Card IDs not found");

    // Get the initial order - first card should be before second card
    const initialFirstCardIndex = 0;
    const initialSecondCardIndex = 1;

    // Drag the first card over the second card to swap positions
    await firstCard.hover();
    await page.mouse.down();

    // Move the mouse to trigger drag
    const firstCardBox = await firstCard.boundingBox();
    if (!firstCardBox) throw new Error("First card bounding box not found");

    await page.mouse.move(
      firstCardBox.x + 10,
      firstCardBox.y + 10,
      { steps: 5 }
    );

    // Get the second card's position
    const secondCardBox = await secondCard.boundingBox();
    if (!secondCardBox) throw new Error("Second card bounding box not found");

    // Move to the second card's position (drag first card below second card)
    await page.mouse.move(
      secondCardBox.x + secondCardBox.width / 2,
      secondCardBox.y + secondCardBox.height / 2,
      { steps: 10 }
    );

    // Release the mouse to drop
    await page.mouse.up();

    // Wait for the drag operation to complete
    await page.waitForTimeout(1000);

    // Verify the cards are still in the same column
    await expect(columnWithMultipleCards.locator(`[data-testid="${firstCardId}"]`)).toBeVisible();
    await expect(columnWithMultipleCards.locator(`[data-testid="${secondCardId}"]`)).toBeVisible();

    // Wait for the DOM to update by checking that the order actually changed
    // We'll poll until the order changes or timeout
    await expect(async () => {
      const cardsAfterDrag = await columnWithMultipleCards.locator('[data-testid^="ticket-card-"]').all();
      const cardIdsAfterDrag = await Promise.all(
        cardsAfterDrag.map(card => card.getAttribute("data-testid"))
      );

      const newFirstCardIndex = cardIdsAfterDrag.indexOf(firstCardId);
      const newSecondCardIndex = cardIdsAfterDrag.indexOf(secondCardId);

      // Verify the order changed - first card should now be after second card
      expect(newFirstCardIndex).toBeGreaterThan(newSecondCardIndex);
    }).toPass({ timeout: 5000 });
  });

  test("should delete a ticket from the detail view", async ({ page }) => {
    await page.goto("/tickets");
    await page.waitForLoadState("networkidle");

    // Wait for animations to settle
    await page.waitForTimeout(500);

    // Find the first visible ticket card
    const firstCard = page.getByTestId(/^ticket-card-/).first();
    await expect(firstCard).toBeVisible();

    // Get the card's ID and title for verification later
    const cardTestId = await firstCard.getAttribute("data-testid");
    if (!cardTestId) throw new Error("Card test ID not found");

    const ticketTitle = await firstCard.locator("h3").textContent();
    if (!ticketTitle) throw new Error("Ticket title not found");

    // Click the card to navigate to detail view
    await firstCard.click();

    // Wait for navigation to ticket detail page
    await expect(page).toHaveURL(/\/tickets\/.+/);
    await page.waitForLoadState("networkidle");

    // Open the ticket options menu (three dots button)
    await page.getByRole("button", { name: "Ticket options" }).click();

    // Wait for the popover to appear
    await page.waitForTimeout(300);

    // Click the "Delete ticket" button
    const deleteButton = page.getByText("Delete ticket");
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // The button text should change to "Click again to confirm"
    await expect(page.getByText("Click again to confirm")).toBeVisible();

    // Click again to confirm deletion
    await page.getByText("Click again to confirm").click();

    // Verify toast notification appears
    await expect(page.getByText("Ticket deleted")).toBeVisible();

    // Verify we're redirected back to the tickets page
    await expect(page).toHaveURL("/tickets");
    await page.waitForLoadState("networkidle");

    // Wait a moment for the page to update
    await page.waitForTimeout(500);

    // Verify the deleted ticket is no longer visible on the board
    await expect(page.locator(`[data-testid="${cardTestId}"]`)).not.toBeVisible();
  });
});
