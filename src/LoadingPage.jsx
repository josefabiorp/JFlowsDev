import React from 'react';
import { ImgLoadingPage } from './components/activity/ImageLoadingPage.jsx';
import { CardLoadingPage } from './components/activity/CardLoading.jsx';
import { EndSectionLoad } from './components/activity/EndSectionLoad.jsx';
import { Header } from '../src/components/Header.jsx';
import { Footer } from '../src/components/Footer.jsx';
import { PriceCard } from './components/activity/PriceCard.jsx';
export function  LoadingPage() {

  return ( 
    <div>
      <Header/>
      <ImgLoadingPage image=".\src\assets\loadingpage.png"/>
      <CardLoadingPage image00=".\src\assets\fast.svg" image01=".\src\assets\efficient.svg" image02=".\src\assets\calendar.svg" image03=".\src\assets\users.svg"/>
      <EndSectionLoad image=".\src\assets\bg1.jpg"/>
      <PriceCard></PriceCard>
      <Footer/>
    </div>
      )
}
