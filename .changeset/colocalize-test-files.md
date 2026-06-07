---

'@grasdouble/slm_parcel_learn': patch
'@grasdouble/slm_parcel_ai-chatbot': patch
'@grasdouble/slm_parcel_header-bar': patch
'@grasdouble/slm_parcel_landing-page': patch
'@grasdouble/slm_parcel_professional-experience': patch
'@grasdouble/slm_shared': patch

---

chore: colocalize test files in `__tests__` at the same level as source.

Test files are now organized according to the convention: tests are placed in a `__tests__` folder at the same directory level as the file being tested, not in a central location. This improves discoverability and follows standard JavaScript/TypeScript practices.
