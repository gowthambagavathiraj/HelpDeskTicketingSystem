# Grok API Setup Guide (xAI)

## 🚀 Get Your Grok API Key

### Step 1: Visit xAI Console
**URL:** https://console.x.ai/

### Step 2: Sign In
- Sign in with your X (Twitter) account
- Or create a new xAI account

### Step 3: Get API Key
1. Go to "API Keys" section
2. Click "Create new secret key"
3. Copy the key (starts with `xai-...`)
4. Save it securely (you won't see it again!)

---

## 📝 Configure Backend

### Update application.properties

Open: `D:\Helpdesk\helpdesk\backend\src\main\resources\application.properties`

Find:
```properties
# Grok AI Agent (xAI)
grok.api.key=${GROK_API_KEY:your_grok_api_key_here}
grok.model=${GROK_MODEL:grok-beta}
```

Replace with:
```properties
# Grok AI Agent (xAI)
grok.api.key=xai-YOUR_ACTUAL_KEY_HERE
grok.model=grok-beta
```

---

## 🧪 Test Grok API

Save as `test-grok.ps1`:

```powershell
$API_KEY = "xai-YOUR_KEY_HERE"

Write-Host "Testing Grok API..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $API_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    model = "grok-beta"
    messages = @(
        @{
            role = "user"
            content = "Say hello in one word"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://api.x.ai/v1/chat/completions" `
        -Method Post `
        -Headers $headers `
        -Body $body
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($response.choices[0].message.content)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
```

Run: `.\test-grok.ps1`

If this works, your API key is valid!

---

## 🔄 Restart Backend

```powershell
# Stop old process
Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force

# Go to backend
cd D:\Helpdesk\helpdesk\backend

# Start with Grok
mvn spring-boot:run
```

---

## 💰 Grok API Pricing

### Free Tier
- **Free credits** on signup
- Good for testing and development

### Paid Tier
- **Pay as you go**
- Check current pricing at: https://console.x.ai/

---

## 🎯 Available Models

| Model | Description | Best For |
|-------|-------------|----------|
| `grok-beta` | Latest Grok model | General use (Recommended) |
| `grok-1` | Grok 1 model | Stable production use |

---

## ✅ Test CampusBot

1. Open: http://localhost:3000
2. Login
3. Click "CampusBot"
4. Ask: "What are the registration steps?"
5. Should see Grok AI response!

---

## 🔍 Troubleshooting

### Error: "API key not configured"
- Check application.properties has the key
- Restart backend after changes

### Error: "Unauthorized"
- API key is invalid or expired
- Get a new key from console.x.ai

### Error: "Rate limit exceeded"
- You've used up free credits
- Add payment method or wait for reset

---

## 📚 Grok API Documentation

**Official Docs:** https://docs.x.ai/

**API Reference:** https://docs.x.ai/api

---

**Your CampusBot now uses Grok AI! 🤖✨**
