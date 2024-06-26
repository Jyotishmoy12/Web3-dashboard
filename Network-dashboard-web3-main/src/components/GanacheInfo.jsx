import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3';
import Chart from 'chart.js/auto';
import './GanacheInfo.css'; // Import CSS file for styling

function GanacheInfo() {
    const [networkId, setNetworkId] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [accountBalances, setAccountBalances] = useState([]);
    const [error, setError] = useState(null);
    const [contractAddress, setContractAddress] = useState('');
    const [nodeInfo, setNodeInfo] = useState(null);
    const [gasPrice, setGasPrice] = useState(null);

    // Reference to the Chart instance
    const chartRef = useRef(null);

    useEffect(() => {
        async function fetchNetworkInfo() {
            try {
                // Connect to Ganache
                const web3 = new Web3('http://127.0.0.1:7545'); // Assuming Ganache is running on localhost:7545

                // Get network ID
                const networkId = await web3.eth.net.getId();
                console.log('Network ID:', networkId);
                setNetworkId(parseInt(networkId));

                // Get accounts
                const accounts = await web3.eth.getAccounts();
                setAccounts(accounts);

                // Get balances
                const balances = await Promise.all(accounts.map(account => web3.eth.getBalance(account)));
                setAccountBalances(balances);

                // Set your smart contract address
                const contractAddress = '0x147A3aF7173FB717d654581Ee82D5Ba203989cC4';
                setContractAddress(contractAddress);

                // Get node info
                const nodeInfo = await web3.eth.getNodeInfo();
                setNodeInfo(nodeInfo);
                // Get gas price
                const gasPrice = await web3.eth.getGasPrice();
                setGasPrice(gasPrice);
            } catch (error) {
                console.error('Error:', error);
                setError(error.message || 'An error occurred');
            }
        }

        fetchNetworkInfo();
    }, []);

    // Create a function to render the line chart
    useEffect(() => {
        if (accountBalances.length > 0) {
            // Destroy the previous Chart instance if it exists
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const ctx = document.getElementById('balance-chart');
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: accounts,
                    datasets: [{
                        label: 'Account Balances (ETH)',
                        data: accountBalances.map(balance => Web3.utils.fromWei(balance, 'ether')),
                        fill: false,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }, [accountBalances, accounts]);

    return (
        <div className="ganache-info">
        <header className="header">
            <h2>Blockchain Network Dashboard</h2>
            {error && <p className="error">Error: {error}</p>}
            <div className="network-info">
                <p>Network ID: {networkId}</p>
                <p>Smart Contract Address: {contractAddress}</p>
                {gasPrice && <p>Gas Price: {Web3.utils.fromWei(gasPrice, 'gwei')} Gwei</p>}
                {nodeInfo && <p>Node Info: {nodeInfo}</p>}
            </div>
        </header>
        <div className="main-content">
            <div className="account-info">
                <h3>Accounts</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Index</th>
                            <th>Address</th>
                            <th>Balance (ETH)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account, index) => (
                            <tr key={index}>
                                <td>{index}</td>
                                <td>{account}</td>
                                <td>{accountBalances.length > 0 && Web3.utils.fromWei(accountBalances[index], 'ether')} ETH</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        {/* Add canvas for Chart.js */}
        <div className="chart-container">
            <canvas id="balance-chart"></canvas>
        </div>
    </div>
    
    );
    
}

export default GanacheInfo;
