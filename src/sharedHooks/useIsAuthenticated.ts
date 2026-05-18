import useCurrentUser from "./useCurrentUser";

// 20260518 FLGMwt: This wrapper was introduced to replace a common pattern of
// checking !!currentUser as a means of answering the question "is a user logged in".
// This makes that pattern more explicit in code, but the main reason for introducing is:
//
// It's unclear when we actually need currentUser or just isAuth'd. This leads to a live
// Realm user being passed across function and prop boundaries. It also complicates memo/effect
// dependency arrays because we need to account for referential stability rather than boolean change
// My hope is we can transition to using this for most cases and simplify things along the way.
const useIsAuthenticated = () => {
  const currentUser = useCurrentUser();
  return !!currentUser;
};

export default useIsAuthenticated;
