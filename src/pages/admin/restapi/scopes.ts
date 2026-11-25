export const SCOPE_GROUPS = [
  { group: "Impacts", scopes: [
    { key: "impacts/read", desc: "Grants read access to impact data." },
    { key: "impacts/status.write", desc: "Grants write access to amend the case status." } ] },
  { group: "Journeys", scopes: [
    { key: "journeys/mode_of_transport.write", desc: "Grants write access to amend the mode of transport on a journey." } ] },
  { group: "Policies", scopes: [
    { key: "policies/read", desc: "Grants read access to read client policies." },
    { key: "policies/write", desc: "Grants write access to write client policies." } ] },
  { group: "Reports", scopes: [
    { key: "reports/read", desc: "Grants read access to read client reports." },
    { key: "reports/write", desc: "Grants write access to write client reports." } ] },
  { group: "Scores", scopes: [
    { key: "scores/read", desc: "Grants read access to entity scores." } ] },
  { group: "Users", scopes: [
    { key: "users/read", desc: "Grants read access to user data." },
    { key: "users/write", desc: "Grants write access to user data." },
    { key: "users/journeys.read", desc: "Grants read access to user journeys." } ] },
];
