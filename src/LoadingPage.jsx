import React from 'react';

import { ImgLoadingPage } from './components/activity/ImageLoadingPage.jsx';
import { CardLoadingPage } from './components/activity/CardLoading.jsx';
import { EndSectionLoad } from './components/activity/EndSectionLoad.jsx';
import { Header } from '../src/components/Header.jsx';
import { Footer } from '../src/components/Footer.jsx';
import { PriceCard } from './components/activity/PriceCard.jsx';

// 🔥 Importación correcta de imágenes (compatible con Vite/Vercel)
import loadingpage from "../src/assets/loadingpage.png";
import fast from "../src/assets/fast.svg";
import efficient from "../src/assets/efficient.svg";
import calendar from "../src/assets/calendar.svg";
import users from "../src/assets/users.svg";
import bg1 from "../src/assets/bg1.jpg";

export function LoadingPage() {
  return (
    <div>
      <Header />

      <ImgLoadingPage image={loadingpage} />

      <CardLoadingPage
        image00={fast}
        image01={efficient}
        image02={calendar}
        image03={users}
      />

      <EndSectionLoad image={bg1} />

      <PriceCard />

      <Footer />
    </div>
  );
}
