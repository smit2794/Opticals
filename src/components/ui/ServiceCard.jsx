import examImg from '../../assets/images/service-exam.png';
import lensImg from '../../assets/images/service-lens.png';
import styleImg from '../../assets/images/service-style.png';
import contactImg from '../../assets/images/service-contact.png';
import repairImg from '../../assets/images/service-repair.png';
import kidsImg from '../../assets/images/service-kids.png';
import './ServiceCard.css';

const imageMap = {
  'eye': examImg,
  'lens': lensImg,
  'style': styleImg,
  'contact': contactImg,
  'repair': repairImg,
  'child': kidsImg
};

const colors = [
  '#8cc63f', // Owl Lime Green
  '#d4b35a', // Owl Warm Gold/Yellow
  '#2f80ed', // Sky Blue
  '#eb5757', // Coral Red
  '#9b59b6', // Deep Purple
  '#1abc9c'  // Clean Teal
];

const colorsRgb = [
  '140, 198, 63',
  '212, 179, 90',
  '47, 128, 237',
  '235, 87, 87',
  '155, 89, 182',
  '26, 188, 156'
];

export default function ServiceCard({ service, index = 0 }) {
  const imageSrc = imageMap[service.icon] || examImg;
  const cardColor = colors[index % colors.length];

  return (
    <div
      className="service-card"
      style={{ 
        '--card-accent': cardColor,
        '--card-accent-rgb': colorsRgb[index % colorsRgb.length]
      }}
    >
      <div className="service-card__image-wrapper">
        <img 
          src={imageSrc} 
          alt={service.title} 
          className="service-card__image" 
          loading="lazy"
        />
      </div>
      <div className="service-card__content">
        <h3 className="service-card__title">{service.title}</h3>
        <p className="service-card__description">{service.description}</p>
      </div>
    </div>
  );
}
