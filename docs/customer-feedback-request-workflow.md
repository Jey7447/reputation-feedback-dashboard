# Customer Feedback Request Workflow

## Purpose

When a customer's visit is completed, n8n creates one feedback request for that visit, builds the secure customer feedback URL, sends it through the selected channel, and records the send result.

The customer does not need a dashboard account. The feedback URL is a bearer link backed by a unique database token, expires after the configured period, and can only create one feedback record.

## n8n workflow

1. **Webhook — Job Completed**
   - Method: POST
   - Expected input:
     - `job_reference`
     - optional `completed_at`
     - optional `channel` (`sms` or `email`)
   - The upstream system should call this when the job is completed.

2. **Validate Job Completion**
   - Require `job_reference`.
   - If `completed_at` is supplied, normalize it to ISO format.
   - Do not send a request when the job reference is missing.

3. **Get Completed Visit**
   - Look up `visits` by unique `job_reference`.
   - Join `customers` and `locations`.
   - Require `completed_at IS NOT NULL`.
   - Return the customer contact details and visit information.

4. **Create / Reuse Feedback Request**
   - Insert one request using `feedback_requests.visit_id`.
   - Use `ON CONFLICT (visit_id) DO NOTHING`.
   - Then select the existing request.
   - This makes the workflow idempotent.

5. **Check Request Status**
   - If `status = sent`, stop. Do not send another request.
   - If `status = pending` or `failed`, continue to the send step.

6. **Build Feedback Link**
   - Base URL should be stored as an n8n environment/config value, not hard-coded in the workflow.
   - URL format:
     `<APP_BASE_URL>/feedback/<feedback_token>`

7. **Send Feedback Request**
   - Email branch: send the feedback URL to the customer's email.
   - SMS branch: send the same URL to the customer's phone.
   - Keep the message short and clear.

8. **Record Result**
   - On successful send:
     - `status = sent`
     - `sent_at = NOW()`
   - On failure:
     - `status = failed`
   - Do not create another feedback request when a send fails; retry the existing request.

## Create / reuse SQL

Use this after the visit lookup:

```sql
INSERT INTO public.feedback_requests (
    visit_id,
    channel
)
VALUES (
    '{{ $json.visit_id }}',
    '{{ $json.channel }}'
)
ON CONFLICT (visit_id) DO NOTHING;

SELECT
    fr.id AS feedback_request_id,
    fr.visit_id,
    fr.channel,
    fr.status,
    fr.feedback_token,
    fr.expires_at,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    c.email AS customer_email,
    v.job_reference,
    v.completed_at,
    l.name AS location_name
FROM public.feedback_requests fr
JOIN public.visits v
    ON v.id = fr.visit_id
JOIN public.customers c
    ON c.id = v.customer_id
JOIN public.locations l
    ON l.id = v.location_id
WHERE fr.visit_id = '{{ $json.visit_id }}';
```

## Mark sent

```sql
UPDATE public.feedback_requests
SET
    status = 'sent',
    sent_at = NOW()
WHERE id = '{{ $json.feedback_request_id }}'
  AND status <> 'sent'
RETURNING
    id AS feedback_request_id,
    status,
    sent_at,
    feedback_token,
    expires_at;
```

## Mark failed

```sql
UPDATE public.feedback_requests
SET
    status = 'failed'
WHERE id = '{{ $json.feedback_request_id }}'
RETURNING
    id AS feedback_request_id,
    status,
    feedback_token,
    expires_at;
```

## Customer form

The customer-facing route is:

`/feedback/<feedback_token>`

The form collects:

- Overall experience: 1–5
- Technician service: 1–5
- Facility: 1–5
- Waiting time: 1–5
- Feedback category: optional
- Comments: optional, maximum 2,000 characters

Submission is accepted only when:

- the token exists
- the request status is `sent`
- the request has not expired
- no feedback already exists for that request

The database function inserts the feedback with `routing_status = 'pending_analysis'`, which feeds directly into the existing **Feedback Intelligence & Routing** workflow.

## Recommended first test

Use one existing `sent` feedback request and open its generated customer URL. Submit a test rating and comment, then verify:

1. A row appears in `feedback`.
2. `routing_status = pending_analysis`.
3. The Feedback Intelligence workflow picks it up.
4. The feedback appears in the dashboard.
5. The same link cannot submit a second feedback record.
