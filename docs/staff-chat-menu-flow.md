# Chat with Us navigation and inline feedback

Security Settings is removed from website chat menu choices, including submenus. Public typed security-help answers remain available. Staff-chat Back returns to the main Chat with Us menu without ending the current conversation. Reopening the staff chat resumes the same live guest session, with a one-second support-system typing indicator; it does not request a second conversation.

End conversation shows the circular S typing indicator before the support system asks for optional Like/Dislike feedback and a comment inside the existing transcript. The original message composer and draft stay visible, disabled while feedback is open. Continue conversation displays typing, preserves the draft and restores sending without submitting feedback. End/Submit feedback returns to the main menu only after the endpoint confirms the end. Errors remain retryable, blank feedback is accepted, and Back is not trapped during feedback save. Session capabilities, cycles, consent, support hours and page-exit behavior are unchanged.

The feedback question is initially scrolled into view. Feedback controls remain inside the message scroller, not a modal or separate page. Mobile chat follows the same flow and renames its help menu option to Security Settings. Updated static-asset cache keys and Android 1.0.85/build 86 metadata are included in the release.

Browser checks use only synthetic local API responses and block external support requests. APK verification and website publication are separate release gates. No backend/rules deployment or patient-data change is included.
