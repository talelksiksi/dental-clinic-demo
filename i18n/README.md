# Translations

The app is written in French. `strings.py` holds the English and Arabic for
every screen, dialog, chart and piece of sample data; run

    python3 mkdict.py i18n/strings.py js/i18n-strings.js

(the generator lives with the site, in PortfolioApp/scripts/mkdict.py) to
rebuild `js/i18n-strings.js`, which the shared cictna-i18n.js served by
cictnardc.net applies in the browser. The demo logins (dentiste / sourire,
assistante / molaire) stay in French, and the dental chart never flips in
Arabic: teeth are always drawn from the patient's point of view.
