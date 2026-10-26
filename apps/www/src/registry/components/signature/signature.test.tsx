import { Children, type ReactNode, isValidElement } from 'react';
import { describe, expect, it } from 'vitest';
import { PdfSignatureBlock } from './signature';

function collectText(node: ReactNode): string[] {
  return Children.toArray(node).flatMap((child) => {
    if (typeof child === 'string' || typeof child === 'number') return [String(child)];
    if (!isValidElement<{ children?: ReactNode }>(child)) return [];
    return collectText(child.props.children);
  });
}

describe('PdfSignatureBlock', () => {
  it('renders without throwing', () => {
    expect(() => PdfSignatureBlock({})).not.toThrow();
  });

  it('keeps two signer places by default', () => {
    const output = collectText(PdfSignatureBlock({ variant: 'double' }));

    expect(output).toContain('Authorized by');
    expect(output).toContain('Approved by');
  });

  it('infers signer count from signers when count is omitted', () => {
    const output = collectText(
      PdfSignatureBlock({
        variant: 'double',
        signers: [{ name: 'Person 1' }, { name: 'Person 2' }, { name: 'Person 3' }],
      })
    );

    expect(output).toContain('Person 3');
  });

  it('renders three signer places when count is 3', () => {
    const output = collectText(
      PdfSignatureBlock({
        variant: 'double',
        count: 3,
        signers: [{ name: 'Person 1' }, { name: 'Person 2' }, { name: 'Person 3' }],
      })
    );

    expect(output).toContain('Person 3');
  });

  it('renders four signer places when count is 4', () => {
    const output = collectText(PdfSignatureBlock({ variant: 'double', count: 4 }));

    expect(output).toContain('Signer 3');
    expect(output).toContain('Signer 4');
  });

  it('keeps a lone third signer half-width and separated from first row', () => {
    const tree = PdfSignatureBlock({ variant: 'double', count: 3 });
    const rows = Children.toArray(tree.props.children);
    const continuation = rows[1];

    expect(isValidElement<{ children?: ReactNode; style?: unknown }>(continuation)).toBe(true);
    if (!isValidElement<{ children?: ReactNode; style?: unknown }>(continuation)) return;

    expect(Children.toArray(continuation.props.children)).toHaveLength(2);
    expect(continuation.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ marginTop: expect.any(Number) })])
    );
  });
});
