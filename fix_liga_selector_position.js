const fs = require('fs');
const filePath = 'src/screens/league/LigaScreen.tsx';
let src = fs.readFileSync(filePath, 'utf8');

// Agregar </ScrollView> antes de })()}
src = src.replace(
  `                    </View>
                  );
                })()}
                )}`,
  `                    </View>
                  </ScrollView>
                  );
                })()}
                )}`
);

fs.writeFileSync(filePath, src, 'utf8');
console.log('✅ ScrollView cerrado correctamente');