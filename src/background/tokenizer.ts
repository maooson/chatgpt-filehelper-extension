import { encode as gptEncode } from 'gpt-3-encoder';

export function encode(input: string): number[] {
  return gptEncode(input)
}