pragma solidity >=0.4.21 <0.6.0;

contract Kyc {

    struct User {
        string signature;
        string mobileHash;
        bool present;
    }
    struct Verifier{
        string bank;
        string publicKey;
    }

    //From User's unique ID -> Verifier
    mapping(string => Verifier) Verifiers;

    mapping(string => User) Users;

    function addVerifier(string memory _id, string memory _bank, string memory _publicKey) public {

    }
    function addUser(string memory _id, string memory _signature, string memory _mobileHash) public {
        require(
            Users[_id].present == true,
            "User already exist"
         );
        Users[_id] = User(_signature, _mobileHash, true);
    }

    function getUser(string memory _id) public view 
}