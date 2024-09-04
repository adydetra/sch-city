import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Flex, Tag, Image, Typography, Button } from 'antd'; // Add Button import
import styles from './index.module.less';
import { Build } from '@/config/data';
import food from '@/resources/images/food.svg';
import play from '@/resources/images/shopping.svg';
import dorm from '@/resources/images/dorm.svg';
import pb from '@/resources/images/public.svg';

interface Props {
  build?: Build;
  showCard: boolean;
  hideCard: () => void;
  backCamera: () => void;
}

const { Paragraph, Text } = Typography;

const Card: React.FC<Props> = ({ showCard, build, hideCard, backCamera }) => {
  const cardRef = useRef(null);
  const [ellipsis, setEllipsis] = useState(true);
  
  useEffect(() => {
    function handleOutsideClick(event: { target: any; }) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        hideCard();
        backCamera();
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <>
      {showCard && (
        <div className={styles.cardBox}>
          <div
            ref={cardRef}
            className={classNames(styles.infoContainer, 'beauti-scroll-bar')}
          >
            {/* Close Button */}
            <Button
              type="primary"
              onClick={() => {
                hideCard();
                backCamera();
              }}
              className={styles.closeButton}
              style={{ position: 'absolute', top: '10', right: '0', marginRight: '20px' }}
              danger
            >
              X
            </Button>

            {/* Title and Image */}
            <div className={styles.title}>
              {build?.type == 'food' && <img src={food} alt="" />}
              {build?.type == 'play' && <img src={play} alt="" />}
              {build?.type == 'dorm' && <img src={dorm} alt="" />}
              {!['food', 'play', 'dorm'].includes(build?.type) && <img src={pb} alt="" />}
              {build?.name}
            </div>
            
            {/* Time */}
            <div className={styles.time}>{build?.info.timeLimit}</div>

            {/* Tags */}
            <Flex gap="4px 0" wrap="wrap" style={{ fontSize: '12px' }}>
              {build?.info.tags?.map((item, index) => (
                <Tag color="gold" key={index}>
                  {item}
                </Tag>
              ))}
            </Flex>

            {/* Info */}
            <div style={{ whiteSpace: 'pre-wrap' }}>
              <Paragraph
                key={ellipsis ? 'expanded' : 'collapsed'}
                ellipsis={
                  ellipsis
                    ? {
                        rows: 30,
                        expandable: true,
                        symbol: 'Teruskan',
                        onExpand: () => setEllipsis(!ellipsis),
                      }
                    : false
                }
              >
                {build?.info.brief}
                {!ellipsis && (
                  <span
                    className={styles.closeBrief}
                    onClick={() => setEllipsis(!ellipsis)}
                  >
                    Tutup
                  </span>
                )}
              </Paragraph>
            </div>

            {/* Photo */}
            {build?.info.photo !== 'resa' && (
              <Flex wrap="wrap" gap={2}>
                <Image.PreviewGroup>
                  {new Array(build?.info.count).fill(0).map((item, index) => (
                    <Image
                      key={index}
                      width={'30%'}
                      height={66}
                      src={build?.info.photo + '/img_' + (index + 1) + '.JPG'}
                    />
                  ))}
                </Image.PreviewGroup>
              </Flex>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Card;
