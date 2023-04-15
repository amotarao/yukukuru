import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 - ゆくくる',
};

export default function Page() {
  return (
    <main className="mx-auto max-w-[480px] px-4 py-12">
      <h1 className="mb-8 text-xl font-bold">特定商取引法に基づく表記</h1>
      <dl className="grid gap-6 [&_dd]:flex [&_dd]:flex-col [&_dd]:gap-2 [&_dt]:mb-3 [&_dt]:font-bold">
        <div>
          <dt>販売業者</dt>
          <dd>
            <p>澤村 阿門</p>
            <p>
              〒104-0061
              <br />
              東京都中央区銀座1-12-4N&E BLD.7階
            </p>
            <p>
              <a className="underline" href="mailto:support@yukukuru.app">
                support@yukukuru.app
              </a>
            </p>
            <p>電話番号はメールでの請求があった場合に遅滞なく提供いたします</p>
          </dd>
        </div>
        <div>
          <dt>販売価格</dt>
          <dd>
            <p>ゆくくるサポーターページをご参照ください</p>
            <p>消費税を含めて表示しています</p>
            <p>
              クレジットカード (Visa, Mastercard, JCB, American Express, Diners Club, Discover) をご利用いただけます
            </p>
          </dd>
        </div>
        <div>
          <dt>引き渡し時期</dt>
          <dd>
            <p>支払いが完了した時点からサービスが開始されます</p>
          </dd>
        </div>
        <div>
          <dt>返品・交換・キャンセル等</dt>
          <dd>
            <p>サービスの性質上、返品・返金はお受けしておりません</p>
          </dd>
        </div>
        <div>
          <dt>中途解約について</dt>
          <dd>
            <p>
              月の途中の解約希望となった場合も１ヶ月分の料金が発生し、日割清算等による返金を含めた一切の返金は行いません
            </p>
            <p>契約期間終了までご利用いただけます</p>
          </dd>
        </div>
      </dl>
    </main>
  );
}
