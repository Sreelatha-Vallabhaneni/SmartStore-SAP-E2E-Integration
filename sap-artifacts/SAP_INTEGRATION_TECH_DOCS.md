# ⚙️ SAP BTP Integration Suite — Technical Design Document

**Project:** SmartStore B2B Order-to-SAP Integration  
**Author:** Sreelatha Vallabhaneni  
**Components:** SAP Cloud Integration (CPI), SAP API Management, SAP Developer Hub  

---

## 1. Solution Overview & Architecture
This document details the middleware design built on **SAP BTP Integration Suite** to receive B2B sales orders from a Next.js web application, enforce API security policies, validate business rules (Danish 4-digit postal code), route orders by monetary value, and handle exceptions gracefully.

### 📸 End-to-End Flow & Live Cockpit Preview
> **[INSERT IMAGE HERE: `screenshots/01-nextjs-live-cockpit.png` — Screenshot of your Next.js UI showing 4/4 green pipeline steps and HTTP 200 OK response]**

---

## 2. SAP API Management Configuration
To avoid exposing the SAP CPI runtime endpoint directly to the public internet, an API Proxy (`SmartStore_Order_Proxy`) was configured as a security and traffic-control gateway.

### 📸 API Proxy Policy Pipeline
> **[INSERT IMAGE HERE: `screenshots/02-apim-policy-flow.png` — Screenshot of API Management Policies view showing ProxyEndpoint and TargetEndpoint policies]**

### 2.1 Security & Traffic Policies

| Flow Stage | Policy Type | Policy Name | Purpose & Configuration |
| :--- | :--- | :--- | :--- |
| **ProxyEndpoint (Incoming)** | `SpikeArrest` | `SpikeArrest_Orders` | Throttles traffic to `10pm` (10 requests/min) to protect backend SAP resources from spikes. |
| **ProxyEndpoint (Incoming)** | `VerifyAPIKey` | `VerifyAPIKey_SS_Orders` | Validates `request.header.APIKey` against a published Developer Hub Product. |
| **TargetEndpoint (Incoming)** | `KeyValueMapOperations` | `Get_CPI_Secrets` | Fetches CPI `clientid` and `clientsecret` from encrypted KVM (`CPI_Credentials_KVM`) into `private.` variables. |
| **TargetEndpoint (Incoming)** | `BasicAuthentication` | `Set_CPI_Auth_Header` | Encodes `private.cpi_user` and `private.cpi_pass` into the outbound `Authorization` header. |

### 2.2 Encrypted Key Value Map (KVM)
To follow enterprise security best practices, zero credentials are hardcoded in XML policies.
* **KVM Name:** `CPI_Credentials_KVM` (Encrypted: `Yes`, Scope: `environment`)
* **Keys Stored:** `cpi_client_id`, `cpi_client_secret`

> **[INSERT IMAGE HERE: `screenshots/03-encrypted-kvm.png` — Screenshot of Encrypted Key Value Map showing masked secret values]**

---

## 3. SAP Cloud Integration (CPI) iFlow Design
The integration flow (`SmartStore_Integration`) processes incoming JSON orders, validates business data, and routes payloads based on order value.

### 📸 CPI Integration Flow (iFlow) Diagram
> **[INSERT IMAGE HERE: `screenshots/04-cpi-iflow-diagram.png` — Screenshot of the complete CPI iFlow canvas including Exception Subprocess]**

### 3.1 Step-by-Step Processing Logic
1. **HTTPS Sender Adapter:**
   * **Endpoint Address:** `/orders`
   * **Authorization:** `User Role` (`ESBMessaging.send`)
   * **CSRF Protection:** Disabled (for stateless REST API calls)
2. **JSON to XML Converter:**
   * Converts incoming JSON into XML wrapped in root element `<OrderRequest>`.
3. **Groovy 4 Validation & Enrichment (`script1.groovy`):**
   * Uses Java's streaming DOM parser (`DocumentBuilderFactory` + `java.io.Reader`) to ensure low memory consumption on Groovy 4 runtimes.
   * **Validation Rule:** Checks `<postalCode>` against regex `^\d{4}$` (Danish 4-digit postal code standard). Throws an exception with `CamelHttpResponseCode = 400` if invalid.
   * **Routing Enrichment:** Reads `<totalAmount>`, determines priority (`HIGH` if `> €1000`, else `STANDARD`), stores `OrderTotalAmount` and `OrderPriority` in Exchange Properties, and sets HTTP response header `X-Order-Priority`.
4. **Content-Based Router (`Order-Router`):**
   * **High-Value Branch:** Non-XML condition `${property.OrderTotalAmount} > '1000'`
   * **Standard Branch:** Configured as `Default Route`
5. **Exception Subprocess (Fault Handling):**
   * Catches validation errors thrown by Groovy, sets `CamelHttpResponseCode = 400` and `Content-Type = application/json`, and returns a structured JSON error payload.

---

## 4. Monitoring & Runtime Verification

### 📸 CPI Message Monitoring & XML Target Output
> **[INSERT IMAGE HERE: `screenshots/05-cpi-message-monitor.png` — Screenshot of SAP CPI Monitor showing `Completed` status and `AGr_...` Message ID]**

> **[INSERT IMAGE HERE: `screenshots/06-error-handling-400.png` — Screenshot showing HTTP 400 Bad Request when testing invalid 5-digit postal code `26300`]**
