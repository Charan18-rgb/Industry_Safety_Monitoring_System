from playwright.sync_api import sync_playwright
import time
import os

def run_verification():
    print("Starting Phase 1 Verification Playwright script...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            permissions=['camera'],
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        # Array to capture console logs for Detector Verification stats
        logs = []
        page.on('console', lambda msg: logs.append(msg.text))

        print("Bypassing Auth...")
        page.goto('http://localhost:3000/auth/login')
        page.evaluate("window.localStorage.setItem('aegis_token', 'test_token'); window.localStorage.setItem('aegis_user', JSON.stringify({id: 'u1', name: 'Admin', role: 'admin'}));")

        print("Navigating to /vision...")
        page.goto('http://localhost:3000/vision', wait_until='networkidle')
        time.sleep(2)

        print("Enabling Helmet Detection...")
        # Toggle Helmet Detection ON
        enable_btn = page.locator('button:has-text("DISABLED / STANDBY")')
        if enable_btn.count() > 0:
            enable_btn.click()
            time.sleep(2)
        else:
            print("Already enabled or button not found.")

        # Test Case A: Compliant (Hardhat visible)
        print("Switching to Compliant Feed...")
        page.locator('button:has-text("Simulate Compliant")').click()
        time.sleep(3) # Wait for AI to process frames
        page.screenshot(path='TEST_CASE_A_COMPLIANT.png')
        print("Captured TEST_CASE_A_COMPLIANT.png")

        # Test Case B: Non-Compliant (Helmet removed)
        print("Switching to Non-Compliant Feed...")
        page.locator('button:has-text("Simulate Non-Compliant")').click()
        time.sleep(3)
        page.screenshot(path='TEST_CASE_B_NON_COMPLIANT.png')
        print("Captured TEST_CASE_B_NON_COMPLIANT.png")

        # Check FPS text
        fps_text = page.locator('span:has-text("FPS")').first.inner_text()
        print(f"Current FPS: {fps_text}")

        # Check runtime stability (Run for an additional 10 seconds to gather logs)
        print("Running continuously to verify stability...")
        time.sleep(10)
        
        print("Verifying no errors in logs...")
        errors = [l for l in logs if "Error" in l or "Failed" in l]
        if len(errors) == 0:
            print("No crashes, freezes, or memory issues detected in logs.")
        else:
            print(f"Warnings/Errors found: {errors}")

        # Extract Detector Verification stats
        yolo_logs = [l for l in logs if "Raw YOLO Results" in l or "Hardhat" in l or "NO-Hardhat" in l]
        print(f"Extracted {len(yolo_logs)} YOLO detection log lines.")
        if len(yolo_logs) > 0:
            print("Sample Detection:")
            print(yolo_logs[-2:]) # Show last couple of detections
        
        # Verify Model Loaded status
        model_status_req = page.request.get("http://localhost:8000/api/helmet/status")
        if model_status_req.ok:
            status_json = model_status_req.json()
            print(f"Model Loaded Status: {status_json}")

        browser.close()
        print("Phase 1 Verification Complete.")

if __name__ == "__main__":
    run_verification()
