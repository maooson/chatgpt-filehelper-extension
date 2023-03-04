import { FC } from "react"
import { PromotionResponse } from "../api"
import { defaults } from "lodash-es"

export type PromotionComponentProps = {
  enabled?: Boolean
  data?: PromotionResponse
}

const promotionWithDefaultValue = {
  title: '开发不易，请我喝杯咖啡吧，感谢您的支持！',
  image: 'https://models.aoq.me/zansm.jpg',
  label: '赞赏码'
}

export const PromotionComponent: FC<PromotionComponentProps> = ({ enabled, data }) => {
  if (!enabled) {
    return (
      <div className="hero bg-gradient-to-b from-purple-500 to-pink-500">
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <p className="mb-5 text-base">
              当前版本：ChatGPT for Wechat{' '}
              <span className="bg-yellow-200 text-yellow-900 py-0.5 px-1.5 text-xs md:text-sm rounded-md uppercase">
                Plus
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const promotion = defaults(data, promotionWithDefaultValue)

  return (
    <div className="hero bg-gradient-to-b from-purple-500 to-pink-500">
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md">
          <p className="mb-5 text-base">{promotion?.title}</p>
          <img className="w-48 h-48" src={promotion?.image} alt={promotion?.label} />
        </div>
      </div>
    </div>
  )
}