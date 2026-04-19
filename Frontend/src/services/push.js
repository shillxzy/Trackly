import { request } from "./auth";

export async function subscribePush(subscription) {
  return await request("/accounts/push/subscribe/", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}

export async function sendPush() {
  return await request("/accounts/push/send/", {
    method: "POST",
  });
}
