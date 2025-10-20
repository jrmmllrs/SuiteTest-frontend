import { useState } from "react";

export const useInvitation = () => {
  const [invitationToken, setInvitationToken] = useState(null);

  const checkForInvitation = () => {
    const hash = window.location.hash;
    const inviteMatch = hash.match(/#\/invitation\/([a-f0-9]+)/);

    if (inviteMatch) {
      const token = inviteMatch[1];
      console.log("Found invitation token:", token);
      setInvitationToken(token);
      return token;
    }
    return null;
  };

  const clearInvitation = () => {
    setInvitationToken(null);
    window.location.hash = "";
  };

  return {
    invitationToken,
    checkForInvitation,
    clearInvitation,
  };
};
