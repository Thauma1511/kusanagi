/* Kusanagi — données d'apprentissage
   Kana : c = caractère, r = romaji (Hepburn), note = précision facultative
   Kanji : fr = sens (le premier sert au QCM), kun = lecture japonaise, on = lecture chinoise
   Dans les lectures, le point sépare la partie écrite en hiragana : « hito.tsu » = 一つ */

const k = (s) => s.trim().split(/\s+/).map((p) => { const [c, r] = p.split('='); return { c, r }; });
const avecNotes = (liste, notes) => liste.map((x) => (notes[x.c] ? { ...x, note: notes[x.c] } : x));

const NOTES_HIRA = {
  'は': 'Comme particule, se prononce « wa ».',
  'へ': 'Comme particule, se prononce « e ».',
  'を': 'Se prononce « o ». Sert presque uniquement de particule.',
  'ん': 'Seule consonne qui s’écrit seule.',
  'ぢ': 'Rare : se prononce comme じ (ji).',
  'づ': 'Rare : se prononce comme ず (zu).',
};
const NOTES_KATA = {
  'ヲ': 'Se prononce « o ». Très rare en katakana.',
  'ン': 'Seule consonne qui s’écrit seule.',
  'ヂ': 'Rare : se prononce comme ジ (ji).',
  'ヅ': 'Rare : se prononce comme ズ (zu).',
  'ヴ': 'Sert à écrire le son « v » des mots étrangers.',
};

const DECKS = [
  {
    id: 'hiragana',
    nom: 'Hiragana',
    jp: 'ひらがな',
    glyphe: 'あ',
    type: 'kana',
    description: 'L’alphabet de base du japonais',
    niveaux: [
      { id: 'base', nom: 'De base', detail: 'あ → ん', items: avecNotes(k(`
        あ=a い=i う=u え=e お=o
        か=ka き=ki く=ku け=ke こ=ko
        さ=sa し=shi す=su せ=se そ=so
        た=ta ち=chi つ=tsu て=te と=to
        な=na に=ni ぬ=nu ね=ne の=no
        は=ha ひ=hi ふ=fu へ=he ほ=ho
        ま=ma み=mi む=mu め=me も=mo
        や=ya ゆ=yu よ=yo
        ら=ra り=ri る=ru れ=re ろ=ro
        わ=wa を=wo ん=n`), NOTES_HIRA) },
      { id: 'accents', nom: 'Avec accents', detail: 'か → が, は → ぱ…', items: avecNotes(k(`
        が=ga ぎ=gi ぐ=gu げ=ge ご=go
        ざ=za じ=ji ず=zu ぜ=ze ぞ=zo
        だ=da ぢ=ji づ=zu で=de ど=do
        ば=ba び=bi ぶ=bu べ=be ぼ=bo
        ぱ=pa ぴ=pi ぷ=pu ぺ=pe ぽ=po`), NOTES_HIRA) },
      { id: 'combi', nom: 'Combinaisons', detail: 'きゃ, しゅ, ちょ…', items: k(`
        きゃ=kya きゅ=kyu きょ=kyo
        しゃ=sha しゅ=shu しょ=sho
        ちゃ=cha ちゅ=chu ちょ=cho
        にゃ=nya にゅ=nyu にょ=nyo
        ひゃ=hya ひゅ=hyu ひょ=hyo
        みゃ=mya みゅ=myu みょ=myo
        りゃ=rya りゅ=ryu りょ=ryo
        ぎゃ=gya ぎゅ=gyu ぎょ=gyo
        じゃ=ja じゅ=ju じょ=jo
        びゃ=bya びゅ=byu びょ=byo
        ぴゃ=pya ぴゅ=pyu ぴょ=pyo`) },
    ],
  },
  {
    id: 'katakana',
    nom: 'Katakana',
    jp: 'カタカナ',
    glyphe: 'ア',
    type: 'kana',
    description: 'Pour les mots étrangers et les noms',
    niveaux: [
      { id: 'base', nom: 'De base', detail: 'ア → ン', items: avecNotes(k(`
        ア=a イ=i ウ=u エ=e オ=o
        カ=ka キ=ki ク=ku ケ=ke コ=ko
        サ=sa シ=shi ス=su セ=se ソ=so
        タ=ta チ=chi ツ=tsu テ=te ト=to
        ナ=na ニ=ni ヌ=nu ネ=ne ノ=no
        ハ=ha ヒ=hi フ=fu ヘ=he ホ=ho
        マ=ma ミ=mi ム=mu メ=me モ=mo
        ヤ=ya ユ=yu ヨ=yo
        ラ=ra リ=ri ル=ru レ=re ロ=ro
        ワ=wa ヲ=wo ン=n`), NOTES_KATA) },
      { id: 'accents', nom: 'Avec accents', detail: 'カ → ガ, ハ → パ…', items: avecNotes(k(`
        ガ=ga ギ=gi グ=gu ゲ=ge ゴ=go
        ザ=za ジ=ji ズ=zu ゼ=ze ゾ=zo
        ダ=da ヂ=ji ヅ=zu デ=de ド=do
        バ=ba ビ=bi ブ=bu ベ=be ボ=bo
        パ=pa ピ=pi プ=pu ペ=pe ポ=po`), NOTES_KATA) },
      { id: 'combi', nom: 'Combinaisons', detail: 'キャ, シュ, チョ…', items: k(`
        キャ=kya キュ=kyu キョ=kyo
        シャ=sha シュ=shu ショ=sho
        チャ=cha チュ=chu チョ=cho
        ニャ=nya ニュ=nyu ニョ=nyo
        ヒャ=hya ヒュ=hyu ヒョ=hyo
        ミャ=mya ミュ=myu ミョ=myo
        リャ=rya リュ=ryu リョ=ryo
        ギャ=gya ギュ=gyu ギョ=gyo
        ジャ=ja ジュ=ju ジョ=jo
        ビャ=bya ビュ=byu ビョ=byo
        ピャ=pya ピュ=pyu ピョ=pyo`) },
      { id: 'modernes', nom: 'Sons modernes', detail: 'ファ, ティ, ヴ…', items: avecNotes(k(`
        ファ=fa フィ=fi フェ=fe フォ=fo
        ティ=ti ディ=di トゥ=tu ドゥ=du
        ウィ=wi ウェ=we
        シェ=she ジェ=je チェ=che
        ヴ=vu ヴァ=va ヴィ=vi ヴェ=ve ヴォ=vo`), NOTES_KATA) },
    ],
  },
  {
    id: 'kanji',
    nom: 'Kanji',
    jp: '漢字',
    glyphe: '山',
    type: 'kanji',
    description: 'Les 80 kanji de 1re année d’école',
    niveaux: [
      { id: 'nombres', nom: 'Nombres', detail: '一 二 三 … 円', items: [
        { c: '一', fr: 'un', on: ['ichi', 'itsu'], kun: ['hito.tsu'] },
        { c: '二', fr: 'deux', on: ['ni'], kun: ['futa.tsu'] },
        { c: '三', fr: 'trois', on: ['san'], kun: ['mi.ttsu'] },
        { c: '四', fr: 'quatre', on: ['shi'], kun: ['yon', 'yo.ttsu'] },
        { c: '五', fr: 'cinq', on: ['go'], kun: ['itsu.tsu'] },
        { c: '六', fr: 'six', on: ['roku'], kun: ['mu.ttsu'] },
        { c: '七', fr: 'sept', on: ['shichi'], kun: ['nana.tsu'] },
        { c: '八', fr: 'huit', on: ['hachi'], kun: ['ya.ttsu'] },
        { c: '九', fr: 'neuf', on: ['kyū', 'ku'], kun: ['kokono.tsu'] },
        { c: '十', fr: 'dix', on: ['jū'], kun: ['tō'] },
        { c: '百', fr: 'cent', on: ['hyaku'], kun: [] },
        { c: '千', fr: 'mille', on: ['sen'], kun: ['chi'] },
        { c: '円', fr: 'yen, cercle', on: ['en'], kun: ['maru.i'] },
      ] },
      { id: 'nature', nom: 'Nature', detail: '日 月 火 水 木…', items: [
        { c: '日', fr: 'soleil, jour', on: ['nichi', 'jitsu'], kun: ['hi', 'ka'] },
        { c: '月', fr: 'lune, mois', on: ['getsu', 'gatsu'], kun: ['tsuki'] },
        { c: '火', fr: 'feu', on: ['ka'], kun: ['hi'] },
        { c: '水', fr: 'eau', on: ['sui'], kun: ['mizu'] },
        { c: '木', fr: 'arbre, bois', on: ['moku', 'boku'], kun: ['ki'] },
        { c: '金', fr: 'or, argent (monnaie)', on: ['kin', 'kon'], kun: ['kane'] },
        { c: '土', fr: 'terre, sol', on: ['do', 'to'], kun: ['tsuchi'] },
        { c: '山', fr: 'montagne', on: ['san'], kun: ['yama'] },
        { c: '川', fr: 'rivière', on: ['sen'], kun: ['kawa'] },
        { c: '田', fr: 'rizière', on: ['den'], kun: ['ta'] },
        { c: '石', fr: 'pierre', on: ['seki', 'shaku'], kun: ['ishi'] },
        { c: '雨', fr: 'pluie', on: ['u'], kun: ['ame'] },
        { c: '天', fr: 'ciel, paradis', on: ['ten'], kun: ['ama', 'ame'] },
        { c: '空', fr: 'ciel, vide', on: ['kū'], kun: ['sora', 'kara'] },
        { c: '気', fr: 'esprit, énergie', on: ['ki', 'ke'], kun: [] },
        { c: '林', fr: 'bosquet', on: ['rin'], kun: ['hayashi'] },
        { c: '森', fr: 'forêt', on: ['shin'], kun: ['mori'] },
        { c: '竹', fr: 'bambou', on: ['chiku'], kun: ['take'] },
        { c: '草', fr: 'herbe', on: ['sō'], kun: ['kusa'] },
        { c: '花', fr: 'fleur', on: ['ka'], kun: ['hana'] },
        { c: '夕', fr: 'soir', on: ['seki'], kun: ['yū'] },
      ] },
      { id: 'corps', nom: 'Corps', detail: '口 目 耳 手 足 力', items: [
        { c: '口', fr: 'bouche', on: ['kō', 'ku'], kun: ['kuchi'] },
        { c: '目', fr: 'œil', on: ['moku'], kun: ['me'] },
        { c: '耳', fr: 'oreille', on: ['ji'], kun: ['mimi'] },
        { c: '手', fr: 'main', on: ['shu'], kun: ['te'] },
        { c: '足', fr: 'pied, jambe', on: ['soku'], kun: ['ashi', 'ta.riru'] },
        { c: '力', fr: 'force', on: ['ryoku', 'riki'], kun: ['chikara'] },
      ] },
      { id: 'personnes', nom: 'Personnes', detail: '人 子 女 男 王', items: [
        { c: '人', fr: 'personne', on: ['jin', 'nin'], kun: ['hito'] },
        { c: '子', fr: 'enfant', on: ['shi', 'su'], kun: ['ko'] },
        { c: '女', fr: 'femme', on: ['jo', 'nyo'], kun: ['onna'] },
        { c: '男', fr: 'homme', on: ['dan', 'nan'], kun: ['otoko'] },
        { c: '王', fr: 'roi', on: ['ō'], kun: [] },
      ] },
      { id: 'positions', nom: 'Positions et mouvements', detail: '上 下 左 右 中…', items: [
        { c: '上', fr: 'haut, dessus', on: ['jō'], kun: ['ue', 'a.geru'] },
        { c: '下', fr: 'bas, dessous', on: ['ka', 'ge'], kun: ['shita', 'sa.geru'] },
        { c: '左', fr: 'gauche', on: ['sa'], kun: ['hidari'] },
        { c: '右', fr: 'droite', on: ['u', 'yū'], kun: ['migi'] },
        { c: '中', fr: 'milieu, dedans', on: ['chū'], kun: ['naka'] },
        { c: '大', fr: 'grand', on: ['dai', 'tai'], kun: ['ō.kii'] },
        { c: '小', fr: 'petit', on: ['shō'], kun: ['chii.sai', 'ko'] },
        { c: '入', fr: 'entrer', on: ['nyū'], kun: ['hai.ru', 'i.ru'] },
        { c: '出', fr: 'sortir', on: ['shutsu'], kun: ['de.ru', 'da.su'] },
        { c: '立', fr: 'se lever, debout', on: ['ritsu'], kun: ['ta.tsu'] },
      ] },
      { id: 'couleurs', nom: 'Couleurs', detail: '白 赤 青', items: [
        { c: '白', fr: 'blanc', on: ['haku'], kun: ['shiro'] },
        { c: '赤', fr: 'rouge', on: ['seki'], kun: ['aka'] },
        { c: '青', fr: 'bleu, vert', on: ['sei'], kun: ['ao'] },
      ] },
      { id: 'objets', nom: 'Animaux et objets', detail: '犬 虫 貝 糸 玉…', items: [
        { c: '犬', fr: 'chien', on: ['ken'], kun: ['inu'] },
        { c: '虫', fr: 'insecte', on: ['chū'], kun: ['mushi'] },
        { c: '貝', fr: 'coquillage', on: [], kun: ['kai'] },
        { c: '糸', fr: 'fil', on: ['shi'], kun: ['ito'] },
        { c: '玉', fr: 'boule, joyau', on: ['gyoku'], kun: ['tama'] },
        { c: '車', fr: 'voiture, véhicule', on: ['sha'], kun: ['kuruma'] },
        { c: '本', fr: 'livre, origine', on: ['hon'], kun: ['moto'] },
      ] },
      { id: 'idees', nom: 'École, lieux et idées', detail: '学 校 字 文 名…', items: [
        { c: '学', fr: 'étudier', on: ['gaku'], kun: ['mana.bu'] },
        { c: '校', fr: 'école', on: ['kō'], kun: [] },
        { c: '字', fr: 'caractère, lettre', on: ['ji'], kun: ['aza'] },
        { c: '文', fr: 'texte, écriture', on: ['bun', 'mon'], kun: ['fumi'] },
        { c: '名', fr: 'nom', on: ['mei', 'myō'], kun: ['na'] },
        { c: '年', fr: 'année', on: ['nen'], kun: ['toshi'] },
        { c: '早', fr: 'tôt, rapide', on: ['sō'], kun: ['haya.i'] },
        { c: '正', fr: 'juste, correct', on: ['sei', 'shō'], kun: ['tada.shii'] },
        { c: '生', fr: 'vie, naître', on: ['sei', 'shō'], kun: ['i.kiru', 'u.mareru', 'nama'] },
        { c: '音', fr: 'son, bruit', on: ['on', 'in'], kun: ['oto', 'ne'] },
        { c: '休', fr: 'se reposer', on: ['kyū'], kun: ['yasu.mu'] },
        { c: '見', fr: 'voir', on: ['ken'], kun: ['mi.ru'] },
        { c: '先', fr: 'avant, devant', on: ['sen'], kun: ['saki'] },
        { c: '町', fr: 'ville, quartier', on: ['chō'], kun: ['machi'] },
        { c: '村', fr: 'village', on: ['son'], kun: ['mura'] },
      ] },
    ],
  },
];

/* Caractères qui se ressemblent : servent de pièges dans le QCM */
const RESSEMBLANCES = [
  // Hiragana
  'あおめぬ', 'ぬめ', 'ねれわ', 'るろ', 'はほけ', 'さちき', 'いりこ', 'こにた', 'たな', 'くへし',
  'うらつそ', 'まもよほ', 'ゆよ', 'せや', 'しつ', 'てそ', 'みか',
  // Katakana
  'シツンソ', 'シツ', 'ソン', 'クケタワウ', 'フヌスラワ', 'コユロヨ', 'チテナキ', 'ノメソン', 'アマムヤ',
  'ルレハ', 'エニコ', 'サセヤ', 'オキモホ', 'ヲフヨ', 'イト', 'ミシツ', 'ネホ',
  // Kanji
  '人入八大', '大犬天', '木本林休村', '日目白百田口月耳', '土王玉生五', '千十手', '右石左名', '上下正',
  '小水', '子字学', '見貝目', '早草花', '町田男', '青生赤', '川三小', '出山', '竹林', '夕名', '力九七',
  '文大六', '虫中口', '円月田', '先生年', '音立日', '空字学', '森林木', '一二三', '四目口', '百白日',
  '校村林',
];

/* Kana avec accent → kana de base (pour les pièges が/か, ば/ぱ/は…) */
const BASES_ACCENTS = (() => {
  const paires = 'がか ぎき ぐく げけ ごこ ざさ じし ずす ぜせ ぞそ だた ぢち づつ でて どと ばは びひ ぶふ べへ ぼほ ぱは ぴひ ぷふ ぺへ ぽほ '
    + 'ガカ ギキ グク ゲケ ゴコ ザサ ジシ ズス ゼセ ゾソ ダタ ヂチ ヅツ デテ ドト バハ ビヒ ブフ ベヘ ボホ パハ ピヒ プフ ペヘ ポホ ヴウ';
  const m = {};
  paires.split(' ').forEach((p) => { m[p[0]] = p[1]; });
  return m;
})();
