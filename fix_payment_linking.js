const fs = require('fs');
let payment = fs.readFileSync('src/screens/plans/PaymentScreen.tsx', 'utf8');

// Fix MP initPoint sin check de window
payment = payment.replace(
  `window.location.href = mpResult.initPoint;
          } else {
            await Linking.openUR`,
  `if (typeof window !== 'undefined') { window.location.href = mpResult.initPoint; }
          else { await Linking.openUR`
);

// Fix segunda ocurrencia sin check
payment = payment.replace(
  `window.location.href = wompiUrl;
        } else {
          await Linking.openURL(wompiUrl);`,
  `if (typeof window !== 'undefined') { window.location.href = wompiUrl; }
        else { await Linking.openURL(wompiUrl); }`
);

fs.writeFileSync('src/screens/plans/PaymentScreen.tsx', payment);
console.log('OK - hrefs fixed');