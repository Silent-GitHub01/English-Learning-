import { get } from "idb-keyval";
import { Candidate, Question, Word } from "../types";
import { shuffle } from "../utils";

function getTrans(word: Word): { cn: string, freq: number }[] {
    let rsMap = new Map<string, { cn: string, freq: number }>();
    word.trans.forEach(item => {
        let target = rsMap.get(item.cn);
        if (target) {
            target.freq += item.frequency || 0;
            rsMap.set(item.cn, target);
        } else {
            rsMap.set(item.cn, { cn: item.cn, freq: item.frequency || 0 });
        }
    })
    return Array.from(rsMap.values());
}

function calCommon(str1: string, str2: string): number {
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();
    let rs = 0;
    let set1 = new Set(str1.split(''));
    let set2 = new Set(str2.split(''));
    for (let char of set1) {
        if (set2.has(char)) {
            rs += 1 << 2;
        } else {
            rs--;
        }
    }
    for (let char of set2) {
        if (set1.has(char)) {
            rs += 1 << 2;
        } else {
            rs--;
        }
    }
    return rs;
}

function calSimilarity(word1: Word, word2: Word): number {
    if (word2.trans.length < word1.trans.length) {
        [word1, word2] = [word2, word1];
    }
    let word1Trans = getTrans(word1);
    let word2Trans = getTrans(word2);
    let word2TransMap = new Map(word2Trans.map(item => [item.cn, item]));

    let similarity = 0;
    word1Trans.forEach((item) => {
        let item2 = word2TransMap.get(item.cn);
        if (item2) {
            const freq1 = item.freq;
            const freq2 = item2.freq;
            similarity += (freq1 * freq2) << 16;
        }
    })

    similarity += calCommon(word1Trans.map(item => item.cn).join(''), word2Trans.map((item) => item.cn).join(''));
    similarity += calCommon(word1.word, word2.word) << 16;
    if (
        word1.word.includes(word2.word) ||
        word2.word.includes(word1.word)
    ) {
        similarity += 1 << 20;
    }
    if (
        word1.relWords.rels.findIndex(rel => rel.words.findIndex(word => word.c === word2.word) !== -1) !== -1 ||
        word2.relWords.rels.findIndex(rel => rel.words.findIndex(word => word.c === word1.word) !== -1) !== -1
    ) {
        similarity += 1 << 20;
        // console.log('relWords', word1.word, word2.word)
    }
    return similarity;
}

export function buildQuestion(word: Word, list: Word[], maxCount: number = 4): Question {
    let similarityList: { word: Word, similarity: number }[] = []
    for (let i = 0; i < list.length; i++) {
        const item = list[i]

        const wordStr = word.word.toLowerCase()
        const itemStr = item.word.toLowerCase()
        if (wordStr === itemStr) continue

        if (word.trans.map(t => t.cn).join('') === item.trans.map(t => t.cn).join('')) continue

        const similarity = calSimilarity(word, item)
        similarityList.push({ word: item, similarity })
    }
    similarityList.sort((a, b) => a.similarity - b.similarity)

    let candidates = similarityList.slice(-(Math.min(maxCount - 1, similarityList.length))).map(v => ({ word: v.word, similarity: v.similarity }))
    candidates.push({ word: word, similarity: Infinity })
    candidates = shuffle(candidates)
    // console.log(candidates)
    const correctIndex = candidates.findIndex(v => v.word === word)
    return {
        candidates,
        correctIndex,
    }
}
