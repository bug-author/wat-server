const WEBARCHIVE_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'ipAddress',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'pHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'webpageUrl',
        type: 'string',
      },
    ],
    name: 'ArchiveCreated',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'archivedItems',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_timestamp',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: '_ipAddress',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_pHash',
        type: 'bytes32',
      },
      {
        internalType: 'string',
        name: '_webpageUrl',
        type: 'string',
      },
    ],
    name: 'setArchive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_hash',
        type: 'bytes32',
      },
    ],
    name: 'verifyHash',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export { WEBARCHIVE_ABI };
