import { test, expect } from '@playwright/test';

test.describe('Doctor Workflow', () => {
  test('Doctor can login and send a chat message', async ({ page }) => {
    // 1. Go to login page
    await page.goto('/login');

    // 2. Fill login form (Using USER provided credentials)
    await page.getByPlaceholder('example@gmail.com').fill('doctor@gmail.com');
    await page.getByPlaceholder('••••••••').fill('Denyeubama1');
    
    // 3. Click Login
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();

    // 4. Handle tenant selection if it appears (Step 2)
    // We wait for either the dashboard OR the tenant selection screen
    try {
      const tenantButton = page.getByText('Phòng khám Đa khoa Quốc tế CDM');
      if (await tenantButton.isVisible({ timeout: 3000 })) {
        await tenantButton.click();
        await page.getByRole('button', { name: 'Xác nhận & Vào hệ thống' }).click();
      }
    } catch (e) {
      // If tenant selection doesn't appear, we might be already logged in or redirected
    }

    // 5. Verify Dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('BÁC SĨ TÚ')).toBeVisible();

    // 6. Go to Chat
    await page.click('a[href="/chat"]');
    
    // 7. Select a patient conversation (Nguyễn Văn A)
    await page.getByText('Nguyễn Văn A').first().click();

    // 8. Send a message
    const messageInput = page.getByPlaceholder('Nhập tin nhắn...');
    await messageInput.fill('Chào anh A, tôi đã nhận được thông tin. Robot auto-test đang hoạt động!');
    await page.locator('button:has(svg.lucide-send), button:has-text("Gửi")').click();

    // 9. Verify message sent (checking for the text in the chat window)
    await expect(page.getByText('Robot auto-test đang hoạt động!')).toBeVisible();
  });
});
