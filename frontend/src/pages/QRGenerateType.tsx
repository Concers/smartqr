import { useParams } from 'react-router-dom';
import QRGenerateWebsitePage from './QRGenerateWebsite';
import QRGeneratePdfPage from './QRGeneratePdf';
import QRGenerateSocialPage from './QRGenerateSocial';
import QRGenerateVcardPage from './QRGenerateVcard';
import QRGenerateVideoPage from './QRGenerateVideo';
import QRGenerateImagePage from './QRGenerateImage';
import QRGenerateWifiPage from './QRGenerateWifi';

export default function QRGenerateTypePage() {
  const { type } = useParams();

  switch (type) {
    case 'website':
      return <QRGenerateWebsitePage />;
    case 'pdf':
      return <QRGeneratePdfPage />;
    case 'links':
      return <QRGenerateSocialPage />;
    case 'vcard':
      return <QRGenerateVcardPage />;
    case 'video':
      return <QRGenerateVideoPage />;
    case 'images':
      return <QRGenerateImagePage />;
    case 'wifi':
      return <QRGenerateWifiPage />;
    default:
      return <QRGenerateWebsitePage />;
  }
}
