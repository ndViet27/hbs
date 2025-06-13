import "vuetify/styles";

import { createVuetify } from "vuetify";
import { VTreeview } from "vuetify/labs/VTreeview";
const vuetify = createVuetify({
  components: {
    VTreeview,
  },
  icons: {
    defaultSet: "mdi",
  },
  treeShake: true,
});
// import '../assets/main.scss'
import "../assets/overwrite.scss";

export default vuetify;
