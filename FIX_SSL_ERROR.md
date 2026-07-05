# Fix SSL Handshake Error with Gemini API

## Error Message:
```
Remote host terminated the handshake
```

This is NOT an API key issue - it's a network/SSL connection problem.

---

## Solution 1: Check Internet Connection

### Test if you can reach Google's servers:

**PowerShell:**
```powershell
Test-NetConnection generativelanguage.googleapis.com -Port 443
```

**Expected output:**
```
TcpTestSucceeded : True
```

If FALSE → Your network is blocking HTTPS connections to Google.

---

## Solution 2: Check Firewall/Antivirus

### Windows Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find "Java" or "javaw.exe"
4. Check both "Private" and "Public"
5. Click OK

### Antivirus
- Temporarily disable antivirus
- Try CampusBot again
- If it works → Add Java to antivirus exceptions

---

## Solution 3: Proxy/VPN Issue

### If you're behind a corporate proxy:

**Set proxy for Java:**

Create file: `D:\Helpdesk\helpdesk\backend\.mvn\jvm.config`

```
-Dhttps.proxyHost=your-proxy-server
-Dhttps.proxyPort=8080
-Dhttp.proxyHost=your-proxy-server
-Dhttp.proxyPort=8080
```

### If using VPN:
- Disconnect VPN
- Try CampusBot
- If it works → VPN is blocking Google APIs

---

## Solution 4: Update Java SSL Certificates

### The issue might be outdated Java certificates:

**PowerShell (Run as Administrator):**
```powershell
cd "C:\Program Files\Java\jdk-22\bin"
.\keytool -import -trustcacerts -alias google -file google.cer -keystore ..\lib\security\cacerts
```

---

## Solution 5: Use HTTP Client with Custom SSL

Update `GeminiAIService.java` to disable SSL verification (TESTING ONLY):

```java
import javax.net.ssl.*;
import java.security.cert.X509Certificate;

@Service
public class GeminiAIService {
    
    public GeminiAIService(RestClient.Builder restClientBuilder) {
        // Disable SSL verification (FOR TESTING ONLY!)
        TrustManager[] trustAllCerts = new TrustManager[]{
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() { return null; }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
            }
        };
        
        try {
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        this.restClient = restClientBuilder
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();
    }
}
```

⚠️ **WARNING:** Only use this for testing! Remove for production!

---

## Solution 6: Check Java Version

Your system shows Java 22.0.2. Some versions have SSL issues.

**Try updating Java:**
1. Download latest JDK: https://www.oracle.com/java/technologies/downloads/
2. Install
3. Update JAVA_HOME environment variable
4. Restart backend

---

## Solution 7: Test with cURL (Verify it's not a Java issue)

**PowerShell:**
```powershell
$key = "YOUR_API_KEY"
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$key"
$body = '{"contents":[{"parts":[{"text":"Hello"}]}]}'

Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
```

If this works → Java/Spring has an SSL issue
If this fails → Network/firewall issue

---

## Solution 8: Change to a Different Google AI Endpoint

Some networks block certain Google services. Try the alternative endpoint:

**In `GeminiAIService.java`:**
```java
this.restClient = restClientBuilder
    .baseUrl("https://ai.google.dev/api")  // Alternative endpoint
    .build();
```

---

## Solution 9: Enable TLS 1.2/1.3

**Add to `application.properties`:**
```properties
# Force TLS 1.2
https.protocols=TLSv1.2,TLSv1.3
```

**Or add JVM argument:**

Create/edit: `D:\Helpdesk\helpdesk\backend\.mvn\jvm.config`
```
-Dhttps.protocols=TLSv1.2,TLSv1.3
-Djdk.tls.client.protocols=TLSv1.2,TLSv1.3
```

---

## Solution 10: Check Date/Time

SSL certificates require correct system time.

**Verify:**
1. Open Windows Settings
2. Time & Language
3. Ensure "Set time automatically" is ON
4. Check if date/time is correct

---

## Troubleshooting Checklist:

- [ ] Can you access https://generativelanguage.googleapis.com in browser?
- [ ] Test-NetConnection shows TcpTestSucceeded = True?
- [ ] Firewall allows Java?
- [ ] Antivirus not blocking?
- [ ] Not using VPN?
- [ ] Not behind corporate proxy?
- [ ] System date/time correct?
- [ ] Java version is latest?
- [ ] Internet connection stable?

---

## Quick Test Script

Save as `test-ssl.ps1`:

```powershell
Write-Host "Testing SSL Connection to Google AI..." -ForegroundColor Cyan

# Test 1: Network connectivity
Write-Host "`n1. Testing network connection..." -ForegroundColor Yellow
$connection = Test-NetConnection generativelanguage.googleapis.com -Port 443
if ($connection.TcpTestSucceeded) {
    Write-Host "   ✅ Network: Connected" -ForegroundColor Green
} else {
    Write-Host "   ❌ Network: FAILED - Cannot reach Google servers" -ForegroundColor Red
    Write-Host "   Solution: Check firewall/VPN/proxy" -ForegroundColor Yellow
    exit
}

# Test 2: HTTPS request
Write-Host "`n2. Testing HTTPS request..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com" -UseBasicParsing
    Write-Host "   ✅ HTTPS: Works" -ForegroundColor Green
} catch {
    Write-Host "   ❌ HTTPS: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: API call
Write-Host "`n3. Testing Gemini API..." -ForegroundColor Yellow
$key = Read-Host "Enter your API key"
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$key"
$body = '{"contents":[{"parts":[{"text":"Hello"}]}]}'

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    Write-Host "   ✅ API: Works perfectly!" -ForegroundColor Green
    Write-Host "   Response: $($response.candidates[0].content.parts[0].text)" -ForegroundColor Green
    Write-Host "`n✅ Your API key and network are fine!" -ForegroundColor Green
    Write-Host "   The issue is with Java/Spring Boot SSL configuration." -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ API: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
```

Run: `.\test-ssl.ps1`

---

## Most Likely Cause:

Based on "Remote host terminated the handshake":

1. **Firewall blocking Java's HTTPS** (most common)
2. **Antivirus interfering with SSL**
3. **Corporate proxy/VPN**
4. **Java SSL certificate issue**

---

## Recommended Fix Order:

1. ✅ Test with PowerShell (Solution 7)
   - If works → Java issue
   - If fails → Network issue

2. ✅ Check firewall (Solution 2)
   - Allow Java through firewall

3. ✅ Add JVM SSL config (Solution 9)
   - Force TLS 1.2

4. ✅ Update Java (Solution 6)
   - Get latest version

---

**After applying fixes, restart backend and try again!**
